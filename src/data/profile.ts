/** Placeholder identity until real accounts exist. */
export const USER = {
  name: 'Aman Adhikari',
} as const;

/** "Aman Adhikari" -> "AA" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
