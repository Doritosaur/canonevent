import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProgressStep } from '@/components/lore';
import { Button, Card, Glow, Icon, IconButton, Screen, Text } from '@/components/ui';
import { stepStatus, useStepProgress } from '@/hooks/useStepProgress';
import { analyzeUpdate } from '@/services/ai';
import { useLore } from '@/state/lore';
import { radius, spacing, useTheme } from '@/theme';

const STEPS = [
  { label: 'Transcribing your update...', glyph: 'check' },
  { label: 'Extracting outcome...', glyph: 'check' },
  { label: 'Updating insights...', glyph: 'check' },
  { label: 'Checking for patterns...', glyph: 'person' },
] as const;

/** Screen 9: Outcome processed. */
export default function Updated() {
  const { colors } = useTheme();
  const { id, duration } = useLocalSearchParams<{ id: string; duration?: string }>();
  const { addUpdate } = useLore();
  const done = useStepProgress(STEPS.length, 800);
  const finished = done >= STEPS.length;
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!finished) return;
    let cancelled = false;
    void analyzeUpdate(Number(duration) || 1).then((text) => {
      if (cancelled) return;
      addUpdate(id, text);
      setSummary(text);
    });
    return () => {
      cancelled = true;
    };
  }, [finished, id, duration, addUpdate]);

  const ready = summary !== null;
  const close = () => router.dismissTo({ pathname: '/entry/[id]', params: { id } });

  return (
    <Screen style={styles.screen}>
      <IconButton icon="close" label="Close" size={30} onPress={close} />

      <View style={styles.hero}>
        <View style={styles.check}>
          <Glow size={150} opacity={0.4} style={styles.checkGlow} />
          <Icon name="check" size={58} color={colors.accent} strokeWidth={2.6} />
        </View>
        <Text variant="hand" style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
          {ready ? 'Update saved!' : 'Saving update...'}
        </Text>
      </View>

      <Card style={styles.steps}>
        {STEPS.map((s, i) => (
          <ProgressStep key={s.label} bare label={s.label} status={stepStatus(i, done)} leadingCheck={s.glyph} />
        ))}
      </Card>

      {ready && (
        <Card style={styles.summary}>
          <Text variant="heading" style={styles.summaryTitle}>
            AI summary of your update
          </Text>
          <Text variant="body" color="textSoft" style={styles.quote}>
            “{summary}”
          </Text>
        </Card>
      )}

      <Button
        label="Nice. Keep going"
        icon="arrow-right"
        disabled={!ready}
        style={styles.cta}
        onPress={close}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginTop: -spacing.xl, marginBottom: spacing.lg },
  check: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  checkGlow: { left: -46, top: -46 },
  title: { fontSize: 50, lineHeight: 56, marginTop: spacing.md, transform: [{ rotate: '-5deg' }] },
  steps: { gap: spacing.md + 2, paddingVertical: spacing.lg, borderRadius: radius.card },
  summary: { marginTop: spacing.md, borderRadius: radius.card, gap: spacing.md },
  summaryTitle: { fontSize: 18 },
  quote: { fontSize: 18, lineHeight: 28 },
  cta: { minHeight: 62, borderRadius: radius.button, marginTop: spacing.lg },
});
