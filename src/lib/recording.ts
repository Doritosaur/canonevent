/**
 * Decides whether a take is worth sending for transcription at all. Cheap, local checks that save a
 * network round trip and a paid transcription call on recordings that cannot contain speech.
 */

/** Shorter than this is a tap, not a thought. */
export const MIN_RECORDING_SECONDS = 1;
/** With metering available, less audible speech than this means the user said nothing. */
export const MIN_VOICED_SECONDS = 0.5;
/** Metering level (0-1, see useRecorder) above which the mic is hearing something. */
export const VOICED_LEVEL = 0.2;

export type TakeStats = {
  seconds: number;
  /** Seconds the mic level was above VOICED_LEVEL. */
  voicedSeconds: number;
  /** False where the platform gives no metering; we can't judge loudness there, so we don't. */
  metered: boolean;
};

export function isEmptyTake({ seconds, voicedSeconds, metered }: TakeStats): boolean {
  if (seconds < MIN_RECORDING_SECONDS) return true;
  return metered && voicedSeconds < MIN_VOICED_SECONDS;
}
