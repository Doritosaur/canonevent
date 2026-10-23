import type { IconName } from '@/components/ui/Icon';
import type { ColorToken } from '@/theme';

export type { IconName };

export type Category = 'Money' | 'Career' | 'Health' | 'Relationships';
export type Outcome = 'bad' | 'mixed' | 'good';

export const CATEGORIES: readonly Category[] = ['Money', 'Career', 'Health', 'Relationships'];

export const categoryMeta: Record<Category, { icon: IconName; tint: ColorToken }> = {
  Money: { icon: 'dollar', tint: 'success' },
  Career: { icon: 'chat', tint: 'purple' },
  Health: { icon: 'fitness', tint: 'warning' },
  Relationships: { icon: 'heart', tint: 'danger' },
};

export type OutcomeUpdate = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  text: string;
};

/** The structured memory the AI extracts from a voice recording. */
export type Draft = {
  title: string;
  category: Category;
  outcome: Outcome;
  summary: string;
  happened: string;
  thinking: string;
  learned: string;
  tags: string[];
  transcript: string;
  analysis: string;
  durationSec: number;
  /** Local file of the voice recording, when one was captured. */
  audioUri?: string;
  /** Client-generated id the memory is saved under (makes saving retryable without duplicates). */
  memoryId?: string;
  /** True once the recording is in storage, so it can be played on any device or after a reload. */
  audioStored?: boolean;
  /** Language the transcriber detected, e.g. hi-IN. */
  language?: string;
  /** True when structuring the transcript failed and the fields above are placeholders, not extracted. */
  fieldsAreFallback?: boolean;
};

export type Entry = Draft & {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  icon: IconName;
  tint: ColorToken;
  updates: OutcomeUpdate[];
};

export type PastSelfAnswer = {
  /** Id the question is saved under, so it can be reopened from the recent list. */
  conversationId: string;
  question: string;
  answer: string;
  considerations: string[];
  related: { entry: Entry; reason: string }[];
};
