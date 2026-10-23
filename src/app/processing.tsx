import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProgressStep, Sparkle, type ProgressStepProps } from '@/components/lore';
import { ArtBoard, Button, Card, IconButton, Screen, Text } from '@/components/ui';
import type { Draft } from '@/data/types';
import { stepStatus, useStepProgress } from '@/hooks/useStepProgress';
import { EmptyRecordingError, newMemoryId } from '@/lib/api';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { analyzeRecording, type AnalysisStage } from '@/services/ai';
import { useLore } from '@/state/lore';
import { spacing } from '@/theme';

const STEPS: Pick<ProgressStepProps, 'label' | 'icon' | 'tint'>[] = [
  { label: 'Transcribing audio...', icon: 'pulse', tint: 'accent' },
  { label: 'Finding key moments...', icon: 'document', tint: 'warning' },
  { label: 'Identifying decision...', icon: 'bulb', tint: 'warning' },
  { label: 'Extracting lessons...', icon: 'tag', tint: 'purple' },
  { label: 'Adding to your lore...', icon: 'database', tint: 'accent' },
];

const leave = () => router.dismissTo('/(tabs)');

/** Screen 4: Processing. */
export default function Processing() {
  const { duration, uri } = useLocalSearchParams<{ duration?: string; uri?: string }>();
  const { setDraft } = useLore();
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 700;
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  // True when the recording held nothing worth saving; retrying the same audio can't help.
  const [empty, setEmpty] = useState(false);
  const [result, setResult] = useState<Draft | null>(null);
  // One id per screen: a retry re-sends the same memory instead of creating a duplicate.
  const [memoryId] = useState(newMemoryId);
  // Real progress: the first step waits for the transcript, the middle ones for the structuring.
  const [stage, setStage] = useState<AnalysisStage | 'done'>('transcribing');
  const [slow, setSlow] = useState(false);
  const cap = stage === 'transcribing' ? 0 : stage === 'structuring' ? STEPS.length - 2 : STEPS.length;
  const done = useStepProgress(STEPS.length, stage === 'done' ? 250 : 900, cap);
  const finished = done >= STEPS.length;

  // Reassurance if the work drags on, so a long wait never looks like a hang.
  useEffect(() => {
    if (stage === 'done' || failed || empty) return;
    const id = setTimeout(() => setSlow(true), 25_000);
    return () => clearTimeout(id);
  }, [stage, failed, empty]);

  // Starts straight away; the step animation is just pacing and doesn't gate the work.
  useEffect(() => {
    let cancelled = false;
    analyzeRecording({
      uri: uri === '' ? undefined : uri,
      durationSec: Number(duration) || 1,
      memoryId,
      onStage: (s) => {
        if (!cancelled) setStage(s);
      },
    })
      .then((draft) => {
        if (cancelled) return;
        setStage('done');
        setResult(draft);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof EmptyRecordingError) {
          deleteAudioFiles([uri]);
          setEmpty(true);
        } else {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [duration, uri, memoryId, attempt]);

  useEffect(() => {
    if (!finished || !result) return;
    setDraft({ ...result, audioUri: uri === '' ? undefined : uri });
    router.replace('/review');
  }, [finished, result, uri, setDraft]);

  const retry = useCallback(() => {
    setFailed(false);
    setSlow(false);
    setStage('transcribing');
    setAttempt((n) => n + 1);
  }, []);

  return (
    <Screen style={styles.screen}>
      <IconButton icon="close" label="Cancel" size={30} onPress={leave} />

      <ArtBoard designWidth={390} designHeight={150} style={styles.hero}>
        <Text variant="hand" style={styles.title} accessibilityRole="header">
          Turning your{'\n'}ramblings into{' '}
          <Text variant="hand" color="accent">
            lore...
          </Text>
        </Text>
        <View style={styles.sparkle}>
          <Sparkle size={30} twinkle />
        </View>
      </ArtBoard>

      {empty ? (
        <View style={styles.padded}>
          <Card style={styles.error} accessibilityLiveRegion="polite">
            <Text variant="heading">I couldn&rsquo;t hear anything</Text>
            <Text color="textMuted">
              There wasn&rsquo;t enough speech in that recording to turn into lore, so nothing was saved.
            </Text>
            <Button label="Record again" icon="mic" onPress={() => router.replace('/record')} />
            <Button label="Close" variant="secondary" onPress={leave} />
          </Card>
        </View>
      ) : failed ? (
        <View style={styles.padded}>
          <Card style={styles.error} accessibilityLiveRegion="polite">
            <Text variant="heading">That one got away</Text>
            <Text color="textMuted">
              We couldn&rsquo;t turn your recording into lore. Your audio is still on this device; give it another go.
            </Text>
            <Button label="Try again" onPress={retry} />
            <Button
              label="Discard"
              variant="secondary"
              onPress={() => {
                deleteAudioFiles([uri]);
                leave();
              }}
            />
          </Card>
        </View>
      ) : (
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <ProgressStep key={s.label} {...s} compact={compact} status={stepStatus(i, done)} enterDelay={i * 90} />
          ))}
          {slow && (
            <Text variant="caption" color="textMuted" style={styles.slow} accessibilityLiveRegion="polite">
              This one&rsquo;s taking a little longer than usual. Hang tight.
            </Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        {/* Decorative: dropped on short screens so the steps never collide with it. */}
        {!compact && (
        <ArtBoard designWidth={390} designHeight={160}>
          <Text variant="note" color="accent" style={styles.note}>
            this won&rsquo;t{'\n'}take long...
          </Text>
        </ArtBoard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  hero: { marginBottom: spacing.sm },
  title: { position: 'absolute', left: 52, top: 10, fontSize: 35, lineHeight: 38, transform: [{ rotate: '-8deg' }] },
  sparkle: { position: 'absolute', left: 280, top: 0 },
  steps: { gap: 6, paddingHorizontal: 20 },
  slow: { textAlign: 'center', marginTop: spacing.md },
  padded: { paddingHorizontal: 28 },
  error: { gap: spacing.md },
  footer: { flex: 1, justifyContent: 'flex-end' },
  note: { position: 'absolute', left: 34, top: 54, fontSize: 28, lineHeight: 32, transform: [{ rotate: '-8deg' }] },
});
