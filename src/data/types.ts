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
  answer: string;
  considerations: string[];
  related: { entry: Entry; reason: string }[];
};
