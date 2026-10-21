/**
 * MOCK AI layer. Every function here returns canned content so the full flow works offline.
 * Swap the bodies for real transcription / LLM calls; the signatures are the contract.
 */
/* eslint-disable @typescript-eslint/require-await -- mock layer: the real implementations will await network calls. */
import type { Draft, Entry, PastSelfAnswer } from '@/data/types';

/** Turns a recording into a structured memory. */
export async function analyzeRecording(durationSec: number): Promise<Draft> {
  return {
    title: 'Bought an expensive GPU',
    category: 'Money',
    outcome: 'bad',
    summary: "Thought I'd make money with AI projects… barely used it.",
    happened:
      "I bought an expensive GPU because I thought I'd make money with AI projects. I barely used it and most of the money is still tied up in hardware.",
    thinking:
      'I assumed I would start and finish multiple AI projects and it would generate income.',
    learned: "Validate demand before spending on tools. Excitement isn't a plan.",
    tags: ['Money', 'AI', 'Impulse purchase'],
    transcript:
      "So I finally bought the GPU. It was a lot of money, more than I should have spent. I told myself I'd build a few AI projects and make it back, but I barely touched it after the first weekend.",
    analysis:
      'Pattern: buying tools before validating demand. The purchase was driven by excitement about the idea, not evidence that anyone wanted the result.',
    durationSec: Math.max(durationSec, 1),
  };
}

/** Summarises a follow-up recording about how a decision turned out. */
export async function analyzeUpdate(_durationSec: number): Promise<string> {
  return "I barely used it. It's mostly been sitting there. I should have validated the project idea first.";
}

/** Answers a question using the user's own history. */
export async function askPastSelf(question: string, entries: Entry[]): Promise<PastSelfAnswer> {
  const q = question.toLowerCase();
  const money = entries.filter((e) => e.category === 'Money');
  const pool = /job|career|work|project/.test(q)
    ? entries.filter((e) => e.category === 'Career')
    : money;
  const related = (pool.length > 0 ? pool : entries).slice(0, 2).map((entry) => ({
    entry,
    reason: entry.category === 'Money' ? 'big purchase' : entry.category.toLowerCase(),
  }));
  const count = Math.max(related.length, 1);

  return {
    answer: `You've made ${count + 2} similar decisions in the past 2 years. Two of them were things you ended up using less than expected.`,
    considerations: [
      'Can you test it with your current setup?',
      'What specific problem does it solve?',
      'Set a budget and a review date.',
    ],
    related,
  };
}
