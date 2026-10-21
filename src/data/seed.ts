import type { Entry } from './types';

/** First-run sample lore, taken from the design mockups. */
export const seedEntries: Entry[] = [
  {
    id: 'seed-gpu',
    title: 'Bought an expensive GPU',
    date: '2024-03-12',
    category: 'Money',
    outcome: 'bad',
    icon: 'dollar',
    tint: 'success',
    summary: "Thought I'd make money with AI projects… barely used it.",
    happened:
      "I bought an expensive GPU because I thought I'd make money with AI projects. I barely used it and most of the money is still tied up in hardware.",
    thinking:
      'I assumed I would start and finish multiple AI projects and it would generate income.',
    learned: "Validate demand before spending on tools. Excitement isn't a plan.",
    tags: ['Money', 'AI', 'Impulse purchase'],
    transcript:
      "So I finally bought the GPU. It was a lot of money, honestly more than I should have spent. I told myself I'd build a few AI projects and make it back, but I barely touched it after the first weekend.",
    analysis:
      'Pattern: buying tools before validating demand. The purchase was driven by excitement about the idea, not by evidence that anyone wanted the result.',
    durationSec: 42,
    updates: [],
  },
  {
    id: 'seed-projects',
    title: 'Said yes to too many projects',
    date: '2024-02-03',
    category: 'Career',
    outcome: 'mixed',
    icon: 'chat',
    tint: 'purple',
    summary: 'Got overwhelmed and delivered mediocre work.',
    happened:
      'I agreed to four projects at once because I did not want to disappoint anyone. Deadlines collided and every project suffered.',
    thinking: "I figured I could squeeze it all in if I worked evenings.",
    learned: 'A clear no protects the quality of every yes.',
    tags: ['Career', 'Overcommitment'],
    transcript:
      "I said yes to everything. Four projects, all due within the same month. I thought I'd manage, and I didn't. The work was fine, never great.",
    analysis:
      'Pattern: underestimating how much time side projects require, and agreeing to avoid short-term discomfort.',
    durationSec: 35,
    updates: [],
  },
  {
    id: 'seed-redflag',
    title: 'Ignored a red flag',
    date: '2024-01-10',
    category: 'Relationships',
    outcome: 'bad',
    icon: 'heart',
    tint: 'danger',
    summary: "Knew it wasn't right but hoped it would work out.",
    happened:
      'I noticed early signs that we wanted different things and chose to look past them.',
    thinking: 'I hoped things would change once we got to know each other better.',
    learned: 'Early signals are usually the honest ones.',
    tags: ['Relationships', 'Intuition'],
    transcript:
      'I saw it right away, honestly. I just really wanted it to work, so I told myself it was nothing.',
    analysis:
      'Pattern: overriding a correct gut feeling because of hope rather than evidence.',
    durationSec: 28,
    updates: [],
  },
  {
    id: 'seed-trip',
    title: 'Booked an expensive trip',
    date: '2023-12-02',
    category: 'Money',
    outcome: 'mixed',
    icon: 'plane',
    tint: 'info',
    summary: "Went for FOMO. Could've planned better.",
    happened:
      'I booked a pricey last-minute trip because friends were going. It was fun, but I spent far more than I intended.',
    thinking: "I didn't want to be the one who missed out.",
    learned: 'Set a budget before saying yes, not after.',
    tags: ['Money', 'FOMO', 'Travel'],
    transcript:
      "Everyone was going, so I booked it that night. Flights alone were double what I'd normally pay.",
    analysis: 'Pattern: social pressure turning into impulse spending.',
    durationSec: 31,
    updates: [],
  },
];
