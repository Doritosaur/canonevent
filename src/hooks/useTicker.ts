import { useEffect, useState } from 'react';

/** Counts up once per second while `running`. Resets only when unmounted. */
export function useTicker(running = true): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return seconds;
}
