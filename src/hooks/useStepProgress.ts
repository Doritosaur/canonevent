import { useEffect, useState } from 'react';

import type { StepStatus } from '@/components/lore';

/**
 * Advances through `total` steps, one every `intervalMs`.
 * Returns the number of finished steps (equal to `total` once complete).
 */
export function useStepProgress(total: number, intervalMs = 900): number {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= total) return;
    const id = setTimeout(() => setDone((d) => d + 1), intervalMs);
    return () => clearTimeout(id);
  }, [done, total, intervalMs]);

  return done;
}

export function stepStatus(index: number, done: number): StepStatus {
  if (index < done) return 'done';
  return index === done ? 'active' : 'pending';
}
