import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Mascot, ProgressStep, Sparkle, type ProgressStepProps } from '@/components/lore';
import { ArtBoard, Button, Card, IconButton, Screen, Text } from '@/components/ui';
import { stepStatus, useStepProgress } from '@/hooks/useStepProgress';
import { analyzeRecording } from '@/services/ai';
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
  const done = useStepProgress(STEPS.length);
  const finished = done >= STEPS.length;

  useEffect(() => {
    if (!finished) return;
    let cancelled = false;
    analyzeRecording(Number(duration) || 1)
      .then((draft) => {
        if (cancelled) return;
        setDraft({ ...draft, audioUri: uri === '' ? undefined : uri });
        router.replace('/review');
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [finished, duration, uri, setDraft, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
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
        <View style={styles.laptop}>
          <Mascot pose="laptop" width={108} />
        </View>
      </ArtBoard>

      {failed ? (
        <View style={styles.padded}>
          <Card style={styles.error} accessibilityLiveRegion="polite">
            <Text variant="heading">That one got away</Text>
            <Text color="textMuted">
              We couldn&rsquo;t turn your recording into lore. Your audio is safe; give it another go.
            </Text>
            <Button label="Try again" onPress={retry} />
            <Button label="Discard" variant="secondary" onPress={leave} />
          </Card>
        </View>
      ) : (
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <ProgressStep key={s.label} {...s} compact={compact} status={stepStatus(i, done)} enterDelay={i * 90} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {/* Decorative: dropped on short screens so the steps never collide with it. */}
        {!compact && (
        <ArtBoard designWidth={390} designHeight={160}>
          <Text variant="note" color="accent" style={styles.note}>
            this won&rsquo;t{'\n'}take long...
          </Text>
          <View style={styles.lying}>
            <Mascot pose="lying" width={176} />
          </View>
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
  laptop: { position: 'absolute', left: 262, top: 42 },
  steps: { gap: 6, paddingHorizontal: 20 },
  padded: { paddingHorizontal: 28 },
  error: { gap: spacing.md },
  footer: { flex: 1, justifyContent: 'flex-end' },
  note: { position: 'absolute', left: 34, top: 54, fontSize: 28, lineHeight: 32, transform: [{ rotate: '-8deg' }] },
  lying: { position: 'absolute', left: 204, top: 56 },
});
