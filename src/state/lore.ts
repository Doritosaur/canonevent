import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { categoryMeta, type Draft, type Entry, type IconName } from '@/data/types';
import { ApiError, deleteAllMemories, deleteMemory, listMemories, reprocessMemory, saveMemory, toEntry } from '@/lib/api';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { todayISO } from '@/lib/format';

const STORAGE_KEY = 'canonevent.v1';

/** How long a delete can be undone before it is sent to the server. */
const UNDO_WINDOW_MS = 10_000;
/** How long to wait before retrying a delete the server hasn't confirmed (offline, signed out). */
const RETRY_MS = 30_000;

/**
 * A delete the user made that the server hasn't confirmed yet. Persisted, so closing the app inside
 * the undo window (or while offline) can't bring the memory back: it is retried on the next launch.
 */
type PendingDelete = {
  dueAt: number;
  audioUri?: string;
  /** If the entry hadn't finished uploading, kept here so Undo can put it back in the outbox. */
  outbox?: OutboxItem;
};

/**
 * A saved memory that hasn't reached the server yet (offline, app closed mid-save, a failed audio
 * upload). Persisted and retried, so saving never loses what the user reviewed. `failed` means the
 * server rejected it for good; it is kept but no longer retried.
 */
type OutboxItem = { draft: Draft; failed?: boolean };

/** Server answers that retrying can't fix: bad request, id taken, too large, unprocessable. */
const PERMANENT_STATUSES = [400, 409, 413, 422];
/** After this many failed processing runs the client stops asking the server to retry on its own. */
const MAX_PROCESSING_ATTEMPTS = 5;

let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;
let outboxTimer: ReturnType<typeof setTimeout> | undefined;
let flushingOutbox = false;
/** Ids being saved right now; a delete for one of them waits until the save settles. */
const savingIds = new Set<string>();

function nextFlushDelay(pending: Record<string, PendingDelete>): number {
  const now = Date.now();
  const delays = Object.values(pending).map((p) => (p.dueAt > now ? p.dueAt - now + 50 : RETRY_MS));
  return Math.min(...delays);
}

function scheduleFlush(pending: Record<string, PendingDelete>) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = undefined;
  if (Object.keys(pending).length === 0) return;
  flushTimer = setTimeout(() => {
    flushTimer = undefined;
    void useLore.getState().flushDeletes();
  }, nextFlushDelay(pending));
}

export type Profile = { name: string; email: string; photoUri?: string };

type Persisted = {
  entries: Entry[];
  hasOnboarded: boolean;
  profile: Profile | null;
  pendingDeletes: Record<string, PendingDelete>;
  outbox: Record<string, OutboxItem>;
};

type LoreState = Persisted & {
  /** False until persisted data has been read; render nothing meaningful before that. */
  ready: boolean;
  /** The memory currently being reviewed, before it is saved. */
  draft: Draft | null;
  setDraft: (draft: Draft | null) => void;
  /** Set after Google sign-in; onboarding finishes once the name and photo are confirmed. */
  setProfile: (profile: Profile) => void;
  completeOnboarding: () => void;
  getEntry: (id: string) => Entry | undefined;
  addEntry: (draft: Draft) => Entry;
  /** Removes an entry and returns it so the caller can offer undo. */
  deleteEntry: (id: string) => Entry | undefined;
  restoreEntry: (entry: Entry) => void;
  /** Uploads saved memories (text first, audio last) that haven't reached the server; failures stay queued. */
  flushOutbox: () => Promise<void>;
  /** Sends every delete whose undo window has passed to the server; failures stay queued for a retry. */
  flushDeletes: () => Promise<void>;
  /** Replaces local entries with the server's, keeping device-only data (audio file, duration). No-op without a backend. */
  syncEntries: () => Promise<void>;
  addUpdate: (id: string, text: string) => void;
  /** Signs out and returns to onboarding. Entries stay on the device. */
  logout: () => void;
  /**
   * Removes every memory on the server and every entry, recording and draft on the device. Rejects
   * (leaving everything in place) if the server can't be reached. Does not touch the onboarding flag.
   */
  deleteAllData: () => Promise<void>;
};

/** Icon names used before the move to the Lucide icon set. */
const LEGACY_ICONS: Record<string, IconName> = {
  'logo-usd': 'dollar',
  'cash-outline': 'dollar',
  'chatbubble-ellipses': 'chat',
  'chatbubble-ellipses-outline': 'chat',
  'heart-outline': 'heart',
  airplane: 'plane',
  'airplane-outline': 'plane',
  'fitness-outline': 'fitness',
};

const migrate = (e: Entry): Entry => ({
  ...e,
  icon: LEGACY_ICONS[e.icon as string] ?? e.icon,
});

const byNewest = (a: Entry, b: Entry) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/**
 * Data saved before the move to zustand is a bare `{ entries, hasOnboarded }`; persist expects
 * `{ state, version }`, so wrap the old shape on read and keep it readable.
 */
const storage: StateStorage = {
  getItem: async (name) => {
    const raw = await AsyncStorage.getItem(name);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as { state?: unknown };
      return parsed.state === undefined ? JSON.stringify({ state: parsed, version: 0 }) : raw;
    } catch {
      return null; // Corrupt storage: start empty; the server copy is pulled again on sync.
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

export const useLore = create<LoreState>()(
  persist(
    (set, get) => ({
      ready: false,
      entries: [],
      hasOnboarded: false,
      profile: null,
      pendingDeletes: {},
      outbox: {},
      draft: null,
      setDraft: (draft) => {
        set({ draft });
      },
      setProfile: (profile) => {
        set({ profile });
      },
      completeOnboarding: () => {
        set({ hasOnboarded: true });
      },
      getEntry: (id) => get().entries.find((e) => e.id === id),
      addEntry: (d) => {
        const meta = categoryMeta[d.category];
        const entry: Entry = {
          ...d,
          id: d.memoryId ?? `${Date.now()}`,
          date: todayISO(),
          icon: meta.icon,
          tint: meta.tint,
          updates: [],
        };
        // Saving twice (a double tap) replaces the entry rather than listing it twice.
        set((s) => ({ entries: [entry, ...s.entries.filter((e) => e.id !== entry.id)].sort(byNewest) }));
        // Nothing is on the server until now: the reviewed memory is queued and uploaded (audio last).
        set((s) => ({ outbox: { ...s.outbox, [entry.id]: { draft: { ...d, memoryId: entry.id } } } }));
        void get().flushOutbox();
        return entry;
      },
      deleteEntry: (id) => {
        const target = get().entries.find((e) => e.id === id);
        if (target) {
          set((s) => {
            const { [id]: queued, ...outbox } = s.outbox;
            return {
              entries: s.entries.filter((e) => e.id !== id),
              outbox,
              pendingDeletes: {
                ...s.pendingDeletes,
                [id]: { dueAt: Date.now() + UNDO_WINDOW_MS, audioUri: target.audioUri, outbox: queued },
              },
            };
          });
          scheduleFlush(get().pendingDeletes);
        }
        return target;
      },
      restoreEntry: (entry) => {
        set((s) => {
          // Indexing a Record doesn't admit a missing key, but there may be none (the delete already went out).
          const undone = s.pendingDeletes[entry.id] as PendingDelete | undefined;
          const { [entry.id]: _undone, ...pendingDeletes } = s.pendingDeletes;
          return {
            pendingDeletes,
            outbox: undone?.outbox ? { ...s.outbox, [entry.id]: undone.outbox } : s.outbox,
            entries: s.entries.some((e) => e.id === entry.id) ? s.entries : [...s.entries, entry].sort(byNewest),
          };
        });
        scheduleFlush(get().pendingDeletes);
        if (entry.id in get().outbox) void get().flushOutbox();
      },
      flushOutbox: async () => {
        if (flushingOutbox) return;
        flushingOutbox = true;
        try {
          for (const [id, item] of Object.entries(get().outbox)) {
            if (item.failed) continue;
            savingIds.add(id);
            try {
              await saveMemory(id, item.draft);
              set((s) => {
                const { [id]: _saved, ...rest } = s.outbox;
                return { outbox: rest };
              });
            } catch (e) {
              if (e instanceof ApiError && PERMANENT_STATUSES.includes(e.status)) {
                set((s) => (id in s.outbox ? { outbox: { ...s.outbox, [id]: { ...item, failed: true } } } : s));
              }
            } finally {
              savingIds.delete(id);
            }
          }
        } finally {
          flushingOutbox = false;
        }
        if (outboxTimer) clearTimeout(outboxTimer);
        outboxTimer = undefined;
        if (Object.values(get().outbox).some((item) => !item.failed)) {
          outboxTimer = setTimeout(() => {
            outboxTimer = undefined;
            void get().flushOutbox();
          }, RETRY_MS);
        }
        // A delete that arrived mid-save was held back; now it can go.
        scheduleFlush(get().pendingDeletes);
      },
      flushDeletes: async () => {
        if (flushing) return;
        flushing = true;
        try {
          const now = Date.now();
          const due = Object.entries(get().pendingDeletes).filter(([id, p]) => p.dueAt <= now && !savingIds.has(id));
          for (const [id, pending] of due) {
            try {
              await deleteMemory(id);
            } catch (e) {
              // Already gone counts as done; anything else (offline, signed out) is retried later.
              if (!(e instanceof ApiError && e.status === 404)) continue;
            }
            deleteAudioFiles([pending.audioUri]);
            set((s) => {
              const { [id]: _done, ...rest } = s.pendingDeletes;
              return { pendingDeletes: rest };
            });
          }
        } finally {
          flushing = false;
        }
        scheduleFlush(get().pendingDeletes);
      },
      addUpdate: (id, text) => {
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, updates: [...e.updates, { date: todayISO(), text }] } : e,
          ),
        }));
      },
      syncEntries: async () => {
        await get().flushOutbox();
        await get().flushDeletes();
        const memories = await listMemories();
        set((s) => {
          const local = new Map(s.entries.map((e) => [e.id, e]));
          const serverIds = new Set(memories.map((m) => m.id));
          const synced = memories
            // A delete the server hasn't confirmed yet (undo window, or being retried) must stay hidden.
            .filter((m) => !(m.id in s.pendingDeletes))
            .map((m) => toEntry(m, { durationSec: local.get(m.id)?.durationSec, audioUri: local.get(m.id)?.audioUri }));
          // Saved on this device but not uploaded yet: keep showing them.
          const unsynced = s.entries.filter((e) => e.id in s.outbox && !serverIds.has(e.id));
          const byId = new Map([...synced, ...unsynced].map((e) => [e.id, e]));
          return { entries: [...byId.values()].sort(byNewest) };
        });
        // Memories whose processing failed or stalled (search wouldn't find them) get another go. The
        // server lets only one run proceed, so asking for one that is already running is harmless.
        const { pendingDeletes } = get();
        for (const m of memories) {
          if (m.processing_status !== 'ready' && m.processing_attempts < MAX_PROCESSING_ATTEMPTS && !(m.id in pendingDeletes)) {
            reprocessMemory(m.id).catch(() => {});
          }
        }
      },
      logout: () => {
        // With a backend the entries belong to the signed-in account, so they must not leak to the next one.
        set(() => ({
          hasOnboarded: false,
          profile: null,
          entries: [],
          outbox: {},
        }));
      },
      deleteAllData: async () => {
        // Server first: if it fails nothing local is touched, so the user can see the data is still there.
        await deleteAllMemories();
        const { entries, pendingDeletes } = get();
        deleteAudioFiles([...entries.map((e) => e.audioUri), ...Object.values(pendingDeletes).map((p) => p.audioUri)]);
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = undefined;
        if (outboxTimer) clearTimeout(outboxTimer);
        outboxTimer = undefined;
        set({ entries: [], draft: null, pendingDeletes: {}, outbox: {} });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: ({ entries, hasOnboarded, profile, pendingDeletes, outbox }): Persisted => ({
        entries,
        hasOnboarded,
        profile,
        pendingDeletes,
        outbox,
      }),
      merge: (persisted, current) => {
        // Data saved before pending deletes were persisted has no such field.
        const saved = persisted as
          | (Omit<Persisted, 'pendingDeletes' | 'outbox'> & Partial<Pick<Persisted, 'pendingDeletes' | 'outbox'>>)
          | undefined;
        return saved
          ? {
              ...current,
              hasOnboarded: saved.hasOnboarded,
              profile: saved.profile ?? null,
              pendingDeletes: saved.pendingDeletes ?? {},
              outbox: saved.outbox ?? {},
              entries: saved.entries.map(migrate),
            }
          : current;
      },
      onRehydrateStorage: () => () => {
        useLore.setState({ ready: true });
        // Deletes interrupted by the app closing are retried now, not only at the next sync.
        scheduleFlush(useLore.getState().pendingDeletes);
        // Saves interrupted by the app closing resume now rather than at the next sync.
        void useLore.getState().flushOutbox();
      },
    },
  ),
);
