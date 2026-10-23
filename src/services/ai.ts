/**
 * The AI layer: recordings, questions and outcome updates, all through the backend API.
 * Nothing here is stored until the caller saves the result; see saveMemory in `@/lib/api`.
 */
import type { Draft, Entry, PastSelfAnswer } from '@/data/types';
import {
  ask,
  EmptyRecordingError,
  extractFields,
  getConversation,
  postUpdate,
  toEntry,
  transcribeRecording,
  type AskResult,
} from '@/lib/api';
import { useLore } from '@/state/lore';

export type AnalysisStage = 'transcribing' | 'structuring';

const STRUCTURE_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * Runs `work` once per key while it is in flight. A screen that mounts twice (dev double-invoke, a
 * quick remount) joins the request already running instead of repeating a paid transcription or an
 * LLM call.
 */
const inflight = new Map<string, Promise<unknown>>();
function once<T>(key: string, work: () => Promise<T>): Promise<T> {
  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;
  const promise = work().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

/**
 * Turns a recording into a draft for the review screen: transcribe, then structure. Nothing is saved
 * anywhere yet. Throws EmptyRecordingError when there is nothing worth saving; the caller discards
 * the recording in that case. `memoryId` is the id the memory will be saved under.
 */
export function analyzeRecording(args: {
  uri?: string;
  durationSec: number;
  memoryId: string;
  onStage?: (stage: AnalysisStage) => void;
}): Promise<Draft> {
  return once(`analyze:${args.memoryId}`, async () => {
    if (!args.uri) throw new EmptyRecordingError();

    args.onStage?.('transcribing');
    const { transcript, language } = await transcribeRecording(args.uri);
    const base = { memoryId: args.memoryId, language, transcript, durationSec: args.durationSec, audioUri: args.uri };

    args.onStage?.('structuring');
    try {
      // Capped: a slow model must never hold the user at the waiting screen. Past the cap the transcript
      // goes to review as it is, and the server structures it after saving.
      return { ...base, ...(await withTimeout(extractFields(transcript), STRUCTURE_TIMEOUT_MS)) };
    } catch {
      // The LLM is down or returned junk: the user can still review and save the transcript, and the
      // server fills the structured fields in later (see fieldsAreFallback).
      const words = transcript.split(/\s+/);
      return {
        ...base,
        fieldsAreFallback: true,
        title: words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : ''),
        category: 'Career',
        outcome: 'mixed',
        summary: transcript.slice(0, 140),
        happened: transcript,
        thinking: '',
        learned: '',
        tags: [],
        analysis: '',
      } satisfies Draft;
    }
  });
}

export type UpdateStage = 'transcribing' | 'saving';

/** Transcripts already paid for, so retrying a failed save doesn't transcribe the same audio again. */
const transcripts = new Map<string, string>();

/**
 * Turns a spoken update about how a decision turned out into text and saves it on the memory.
 * Returns the text. Throws EmptyRecordingError if there is no speech (nothing is saved).
 */
export function recordOutcomeUpdate(args: {
  memoryId: string;
  uri: string;
  onStage?: (stage: UpdateStage) => void;
}): Promise<string> {
  return once(`update:${args.memoryId}:${args.uri}`, async () => {
    let text = transcripts.get(args.uri);
    if (text === undefined) {
      args.onStage?.('transcribing');
      text = (await transcribeRecording(args.uri)).transcript;
      transcripts.set(args.uri, text);
    }
    args.onStage?.('saving');
    // The memory may still be waiting in the outbox; the update needs it to exist on the server.
    await useLore.getState().flushOutbox();
    await postUpdate(args.memoryId, text);
    transcripts.delete(args.uri);
    return text;
  });
}

/** Turns a spoken question into text. Throws EmptyRecordingError if there is no speech. */
export async function transcribeQuestion(uri: string): Promise<string> {
  const { transcript } = await transcribeRecording(uri);
  return transcript;
}

function toAnswer(result: AskResult, entries: Entry[]): PastSelfAnswer {
  const local = new Map(entries.map((e) => [e.id, e]));
  return {
    conversationId: result.conversation_id,
    question: result.question,
    answer: result.answer,
    considerations: result.considerations,
    // One row per memory: the list is keyed by entry id.
    related: result.related
      .filter((r, i, all) => all.findIndex((x) => x.memory.id === r.memory.id) === i)
      .map((r) => {
        const known = local.get(r.memory.id);
        return { entry: toEntry(r.memory, { durationSec: known?.durationSec, audioUri: known?.audioUri }), reason: r.reason };
      }),
  };
}

/**
 * Answers a question from the user's own history. `id` is the conversation the answer is saved under;
 * asking again with the same id returns what was saved rather than asking the LLM a second time.
 */
export function askPastSelf(question: string, id: string, entries: Entry[]): Promise<PastSelfAnswer> {
  return once(`ask:${id}`, () => ask(question, id)).then((r) => toAnswer(r, entries));
}

/** Reopens a question from the recent list, exactly as it was answered. */
export function openPastAnswer(id: string, entries: Entry[]): Promise<PastSelfAnswer> {
  return getConversation(id).then((r) => toAnswer(r, entries));
}
