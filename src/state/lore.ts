import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { seedEntries } from '@/data/seed';
import { categoryMeta, type Draft, type Entry, type IconName } from '@/data/types';
import { todayISO } from '@/lib/format';

const STORAGE_KEY = 'canonevent.v1';

type Persisted = { entries: Entry[]; hasOnboarded: boolean };

type LoreState = Persisted & {
  /** False until persisted data has been read; render nothing meaningful before that. */
  ready: boolean;
  /** The memory currently being reviewed, before it is saved. */
  draft: Draft | null;
  setDraft: (draft: Draft | null) => void;
  completeOnboarding: () => void;
  getEntry: (id: string) => Entry | undefined;
  addEntry: (draft: Draft) => Entry;
  /** Removes an entry and returns it so the caller can offer undo. */
  deleteEntry: (id: string) => Entry | undefined;
  restoreEntry: (entry: Entry) => void;
  addUpdate: (id: string, text: string) => void;
  /** Back to the welcome screen. Entries stay on the device. */
  logout: () => void;
  /** Removes every entry and any draft. Does not touch the onboarding flag. */
  deleteAllData: () => void;
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
      return null; // Corrupt storage: fall back to the seed data.
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

export const useLore = create<LoreState>()(
  persist(
    (set, get) => ({
      ready: false,
      entries: seedEntries,
      hasOnboarded: false,
      draft: null,
      setDraft: (draft) => {
        set({ draft });
      },
      completeOnboarding: () => {
        set({ hasOnboarded: true });
      },
      getEntry: (id) => get().entries.find((e) => e.id === id),
      addEntry: (d) => {
        const meta = categoryMeta[d.category];
        const entry: Entry = {
          ...d,
          id: `${Date.now()}`,
          date: todayISO(),
          icon: meta.icon,
          tint: meta.tint,
          updates: [],
        };
        set((s) => ({ entries: [entry, ...s.entries].sort(byNewest) }));
        return entry;
      },
      deleteEntry: (id) => {
        const target = get().entries.find((e) => e.id === id);
        if (target) set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        return target;
      },
      restoreEntry: (entry) => {
        set((s) => ({
          entries: s.entries.some((e) => e.id === entry.id) ? s.entries : [...s.entries, entry].sort(byNewest),
        }));
      },
      addUpdate: (id, text) => {
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, updates: [...e.updates, { date: todayISO(), text }] } : e,
          ),
        }));
      },
      logout: () => {
        set({ hasOnboarded: false });
      },
      deleteAllData: () => {
        set({ entries: [], draft: null });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: ({ entries, hasOnboarded }): Persisted => ({ entries, hasOnboarded }),
      merge: (persisted, current) => {
        const saved = persisted as Persisted | undefined;
        return saved ? { ...current, hasOnboarded: saved.hasOnboarded, entries: saved.entries.map(migrate) } : current;
      },
      onRehydrateStorage: () => () => {
        useLore.setState({ ready: true });
      },
    },
  ),
);
