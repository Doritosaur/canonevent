import { useEffect, useState } from 'react';

import type { StepStatus } from '@/components/lore';

/**
 * Advances through `total` steps, one every `intervalMs`, never past `cap` finished steps.
 * Lowering `cap` holds the progress where it is, so steps that stand for real work wait for it
 * instead of ticking on regardless. Returns the number of finished steps.
 */
export function useStepProgress(total: number, intervalMs = 900, cap = total): number {
  const [done, setDone] = useState(0);
  const limit = Math.min(total, cap);

  useEffect(() => {
    if (done >= limit) return;
    const id = setTimeout(() => setDone((d) => d + 1), intervalMs);
    return () => clearTimeout(id);
  }, [done, limit, intervalMs]);

  return done;
}

export function stepStatus(index: number, done: number): StepStatus {
  if (index < done) return 'done';
  return index === done ? 'active' : 'pending';
}
