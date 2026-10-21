/** 28 -> "0:28" */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** "2024-03-12" -> "Mar 12, 2024" (UTC so the day never shifts with the device timezone). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "2024-03-12" -> "March 2024" */
export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthsBetween(fromISO: string, to = new Date()): number {
  const from = new Date(fromISO);
  return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
}

/** "2 months later..." / "1 year later..." */
export function formatElapsed(fromISO: string): string {
  const months = Math.max(1, monthsBetween(fromISO));
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'year' : 'years'} later...`;
  }
  return `${months} ${months === 1 ? 'month' : 'months'} later...`;
}

/** Whole months spanned by the dates, at least 1. */
export function monthsSpan(dates: string[]): number {
  if (dates.length === 0) return 1;
  const earliest = dates.reduce((a, b) => (a < b ? a : b));
  return Math.max(1, monthsBetween(earliest));
}
