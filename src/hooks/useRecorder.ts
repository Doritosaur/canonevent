import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { VOICED_LEVEL, type TakeStats } from '@/lib/recording';

export type RecorderStatus = 'idle' | 'starting' | 'recording' | 'denied' | 'error';

export type RecordingResult = TakeStats & {
  /** Local file of the recording, when one was written. */
  uri?: string;
};

/** How often the mic level is sampled to judge whether the user actually spoke. */
const SAMPLE_MS = 250;

const OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
  // The cache directory can be cleared by the OS; entries keep their audio.
  directory: 'document' as const,
};

/** Metering is in dBFS; anything quieter than this reads as silence. */
const FLOOR_DB = -50;

/**
 * Records from the microphone as soon as the screen mounts.
 *
 * `level` is 0–1 (undefined while no metering is available) so the waveform can follow the voice,
 * and `status` tells the screen when to show the permission or error states.
 */
export function useRecorder({ autoStart = true }: { autoStart?: boolean } = {}) {
  const recorder = useAudioRecorder(OPTIONS);
  const recState = useAudioRecorderState(recorder, 80);
  const [status, setStatus] = useState<RecorderStatus>(autoStart ? 'starting' : 'idle');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);
  const began = useRef(false);
  const voicedMs = useRef(0);
  const metered = useRef(false);
  const levelRef = useRef<number | undefined>(undefined);

  const start = useCallback(async () => {
    setStatus('starting');
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setCanAskAgain(permission.canAskAgain);
        setStatus('denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      voicedMs.current = 0;
      metered.current = false;
      setSeconds(0);
      setStatus('recording');
    } catch {
      setStatus('error');
    }
  }, [recorder]);

  useEffect(() => {
    if (began.current || !autoStart) return;
    began.current = true;
    void start();
  }, [start, autoStart]);

  useEffect(() => {
    if (status !== 'recording') return;
    const id = setInterval(() => {
      if (startedAt.current) setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  const stop = useCallback(async (): Promise<RecordingResult> => {
    const elapsed = startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) : 1;
    try {
      await recorder.stop();
    } catch {
      // Stopping a recorder that never started is harmless.
    }
    return {
      uri: recorder.uri ?? undefined,
      seconds: elapsed,
      voicedSeconds: voicedMs.current / 1000,
      metered: metered.current,
    };
  }, [recorder]);

  const metering = recState.metering;
  const level =
    status === 'recording' && typeof metering === 'number'
      ? Math.min(1, Math.max(0, (metering - FLOOR_DB) / -FLOOR_DB))
      : undefined;

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Tallies how long the user was audibly speaking, so an empty take can be rejected before upload.
  useEffect(() => {
    if (status !== 'recording') return;
    const id = setInterval(() => {
      const current = levelRef.current;
      if (current === undefined) return;
      metered.current = true;
      if (current > VOICED_LEVEL) voicedMs.current += SAMPLE_MS;
    }, SAMPLE_MS);
    return () => clearInterval(id);
  }, [status]);

  return { status, canAskAgain, seconds, level, stop, retry: start };
}
