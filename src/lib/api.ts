import { Platform } from 'react-native';

import { categoryMeta, type Category, type Draft, type Entry, type Outcome } from '@/data/types';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type RawBody = { blob: Blob; contentType: string };

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; raw?: RawBody } = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError('Not signed in', 401);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/api${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': init.raw?.contentType ?? 'application/json',
      apikey: SUPABASE_ANON_KEY ?? '',
      Authorization: `Bearer ${token}`,
    },
    body: init.raw ? init.raw.blob : init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new ApiError(await res.text(), res.status);
  return res.status === 204 ? (null as T) : ((await res.json()) as T);
}

// ---------------------------------------------------------------------------
// Server shapes and mapping to the UI's Entry/Draft
// ---------------------------------------------------------------------------

export type ServerMemory = {
  id: string;
  title: string | null;
  content: string;
  input_type: 'voice' | 'text';
  occurred_at: string | null;
  created_at: string;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  processing_error: string | null;
  processing_attempts: number;
  audio_uploaded_at: string | null;
  language: string | null;
  category: Category | null;
  outcome: Outcome | null;
  summary: string | null;
  happened: string | null;
  thinking: string | null;
  learned: string | null;
  tags: string[];
  analysis: string | null;
  memory_updates?: { id: string; occurred_on: string; text: string }[];
};

type Local = { durationSec?: number; audioUri?: string };

/** Fallbacks cover memories whose LLM extraction failed; they stay readable from the transcript. */
export function toDraft(m: ServerMemory, local: Local = {}): Draft {
  return {
    memoryId: m.id,
    language: m.language ?? undefined,
    audioStored: m.audio_uploaded_at !== null,
    title: m.title ?? 'Untitled',
    category: m.category ?? 'Career',
    outcome: m.outcome ?? 'mixed',
    summary: m.summary ?? m.content.slice(0, 140),
    happened: m.happened ?? m.content,
    thinking: m.thinking ?? '',
    learned: m.learned ?? '',
    tags: m.tags,
    transcript: m.content,
    analysis: m.analysis ?? '',
    durationSec: local.durationSec ?? 0,
    // A web blob URL only lives as long as the page, so once the audio is stored it is no use to keep.
    audioUri: Platform.OS === 'web' && m.audio_uploaded_at !== null ? undefined : local.audioUri,
  };
}

export function toEntry(m: ServerMemory, local: Local = {}): Entry {
  const draft = toDraft(m, local);
  const meta = categoryMeta[draft.category];
  return {
    ...draft,
    id: m.id,
    date: (m.occurred_at ?? m.created_at).slice(0, 10),
    icon: meta.icon,
    tint: meta.tint,
    updates: (m.memory_updates ?? [])
      .map((u) => ({ date: u.occurred_on, text: u.text }))
      .sort((a, b) => (a.date < b.date ? -1 : 1)),
  };
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const listMemories = () => request<{ memories: ServerMemory[] }>('/memories').then((r) => r.memories);

export const getMemory = (id: string) => request<{ memory: ServerMemory }>(`/memories/${id}`).then((r) => r.memory);

export const patchMemory = (
  id: string,
  fields: Partial<Pick<ServerMemory, 'title' | 'happened' | 'thinking' | 'learned' | 'tags'>>,
) => request<{ memory: ServerMemory }>(`/memories/${id}`, { method: 'PATCH', body: fields });

/** A short-lived link that streams the stored recording; works on any device. */
export const getAudioUrl = (id: string) => request<{ url: string }>(`/memories/${id}/audio`).then((r) => r.url);

export const deleteMemory = (id: string) => request<null>(`/memories/${id}`, { method: 'DELETE' });

/** Removes every memory (and its audio) the signed-in user owns, including ones this device never loaded. */
export const deleteAllMemories = () => request<{ deleted: number }>('/memories', { method: 'DELETE' });

export type AskResult = {
  conversation_id: string;
  question: string;
  answer: string;
  considerations: string[];
  related: { reason: string; memory: ServerMemory }[];
  created_at: string;
};

/** Asks a question of the user's memories. Passing the same `id` again returns the saved answer. */
export const ask = (question: string, id: string) =>
  request<AskResult>('/ask', { method: 'POST', body: { id, question } });

/** A question asked before, exactly as it was answered. */
export const getConversation = (id: string) => request<AskResult>(`/conversations/${id}`);

export type Conversation = { id: string; title: string | null; created_at: string };

/** The most recent questions, newest first. */
export const listConversations = (limit = 8) =>
  request<{ conversations: Conversation[] }>(`/conversations?limit=${limit}`).then((r) => r.conversations);

export const deleteConversation = (id: string) => request<null>(`/conversations/${id}`, { method: 'DELETE' });

/** Records how a decision turned out. The memory must already be on the server. */
export const postUpdate = (memoryId: string, text: string) =>
  request<{ update: { id: string; occurred_on: string; text: string } }>(`/memories/${memoryId}/updates`, {
    method: 'POST',
    body: { text },
  }).then((r) => r.update);

/** Client-generated so a retried create returns the same memory instead of a duplicate. */
export function newMemoryId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = Math.floor(Math.random() * 16);
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Nothing worth saving: too short, silent, or no intelligible speech. Nothing was stored anywhere. */
export class EmptyRecordingError extends Error {
  constructor() {
    super('empty_recording');
  }
}

const SUPPORTED_AUDIO = ['audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];

/** Anything smaller than this is silence or a stray tap; the server enforces the same floor. */
const MIN_AUDIO_BYTES = 2048;
const POLL_MS = 1500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
/** Consecutive failed polls tolerated (a network blip) before giving up. */
const MAX_POLL_FAILURES = 5;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function readAudio(uri: string): Promise<{ blob: Blob; contentType: string }> {
  const blob = await (await fetch(uri)).blob();
  // Native recordings are m4a; the browser reports its own container (e.g. audio/webm;codecs=opus).
  const reported = blob.type.split(';')[0];
  const contentType =
    Platform.OS === 'web' ? (SUPPORTED_AUDIO.includes(reported) ? reported : 'audio/webm') : 'audio/mp4';
  return { blob, contentType };
}

/**
 * Turns a recording into text. The audio is sent for transcription and discarded: nothing is stored
 * on the server until the user saves the reviewed result (see saveMemory). Throws
 * EmptyRecordingError, without calling the transcriber, when the file is too small to hold speech.
 */
export async function transcribeRecording(uri: string): Promise<{ transcript: string; language?: string }> {
  const raw = await readAudio(uri);
  if (raw.blob.size < MIN_AUDIO_BYTES) throw new EmptyRecordingError();

  let jobId: string;
  try {
    ({ job_id: jobId } = await request<{ job_id: string }>('/transcriptions', { method: 'POST', raw }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) throw new EmptyRecordingError();
    throw e;
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let failures = 0;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    let job: { status: string; transcript?: string; language_code?: string | null; useful?: boolean; error?: string };
    try {
      job = await request(`/transcriptions/${jobId}`);
      failures = 0;
    } catch (e) {
      // 404: the service restarted and lost the job, so polling again can't help.
      if ((e instanceof ApiError && e.status === 404) || ++failures >= MAX_POLL_FAILURES) throw e;
      continue;
    }
    if (job.status === 'running') continue;
    if (job.status === 'failed') throw new ApiError(job.error ?? 'Transcription failed', 502);
    if (!job.useful) throw new EmptyRecordingError();
    return { transcript: (job.transcript ?? '').trim(), language: job.language_code ?? undefined };
  }
  throw new ApiError('Timed out waiting for the transcript', 504);
}

export type ExtractedFields = Pick<
  Draft,
  'title' | 'category' | 'outcome' | 'summary' | 'happened' | 'thinking' | 'learned' | 'tags' | 'analysis'
>;

/** Structures a transcript for the review screen. Stateless; nothing is stored. */
export const extractFields = (content: string) =>
  request<{ fields: ExtractedFields }>('/extract', { method: 'POST', body: { content } }).then((r) => r.fields);

/**
 * Saves a reviewed memory: the text first (so it is searchable at once), then the audio as the very
 * last step. Safe to repeat with the same id after any failure: the create is idempotent, a fresh
 * upload URL is issued until the audio has arrived, and confirming twice is harmless.
 */
export async function saveMemory(id: string, d: Draft): Promise<void> {
  let audio: { blob: Blob; contentType: string } | null = null;
  if (d.audioUri) {
    try {
      const read = await readAudio(d.audioUri);
      if (read.blob.size >= MIN_AUDIO_BYTES) audio = read;
    } catch {
      // The local file is gone; the text is still worth keeping.
    }
  }

  // When extraction failed at review time the fields are placeholders: leave them out so the server
  // extracts them during processing instead of storing guesses.
  const fields = d.fieldsAreFallback
    ? {}
    : {
        title: d.title,
        category: d.category,
        outcome: d.outcome,
        summary: d.summary,
        happened: d.happened,
        thinking: d.thinking,
        learned: d.learned,
        tags: d.tags,
        analysis: d.analysis,
      };
  const content = d.transcript.trim() || d.happened.trim() || d.summary.trim();

  const created = await request<{ memory: ServerMemory; upload_url: string | null }>('/memories', {
    method: 'POST',
    body: audio
      ? { id, input_type: 'voice', content, language: d.language, audio_content_type: audio.contentType, ...fields }
      : { id, input_type: 'text', content, ...fields },
  });
  if (!audio || !created.upload_url) return;

  const upload = await fetch(created.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': audio.contentType },
    body: audio.blob,
  });
  // Reported as 502 so it is retried: a bad upload is never the user's mistake.
  if (!upload.ok) throw new ApiError(`Audio upload failed (${upload.status})`, 502);
  await request(`/memories/${id}/confirm`, { method: 'POST' });
}

/** Asks the server to retry processing a memory that failed or stalled. A no-op if it is already ready. */
export const reprocessMemory = (id: string) =>
  request<{ queued: number }>(`/memories/${id}/reprocess`, { method: 'POST', body: {} });
