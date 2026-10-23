import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProgressStep } from '@/components/lore';
import { Button, Card, Glow, Icon, IconButton, Screen, Text } from '@/components/ui';
import { stepStatus, useStepProgress } from '@/hooks/useStepProgress';
import { EmptyRecordingError } from '@/lib/api';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { recordOutcomeUpdate, type UpdateStage } from '@/services/ai';
import { useLore } from '@/state/lore';
import { radius, spacing, useTheme } from '@/theme';

const STEPS = [
  { label: 'Transcribing your update...', glyph: 'check' },
  { label: 'Saving it to this memory...', glyph: 'check' },
] as const;

/** Screen 9: Outcome processed. */
export default function Updated() {
  const { colors } = useTheme();
  const { id, uri } = useLocalSearchParams<{ id: string; uri?: string }>();
  const { addUpdate } = useLore();
  const [stage, setStage] = useState<UpdateStage | 'done'>('transcribing');
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // No recording, or one with no speech in it: retrying the same audio can't help.
  const [silent, setSilent] = useState(false);
  const empty = silent || !uri;

  // The steps stand for real work: each waits until the stage before it has finished.
  const cap = stage === 'transcribing' ? 0 : stage === 'saving' ? 1 : STEPS.length;
  const done = useStepProgress(STEPS.length, 500, cap);

  useEffect(() => {
    if (!uri) return;
    let cancelled = false;
    recordOutcomeUpdate({
      memoryId: id,
      uri,
      onStage: (s) => {
        if (!cancelled) setStage(s);
      },
    })
      .then((text) => {
        if (cancelled) return;
        addUpdate(id, text);
        setSummary(text);
        setStage('done');
        // The audio was only needed for its words.
        deleteAudioFiles([uri]);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof EmptyRecordingError) {
          deleteAudioFiles([uri]);
          setSilent(true);
        } else {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, uri, addUpdate, attempt]);

  const ready = summary !== null && done >= STEPS.length;
  const problem = empty || failed;
  const close = () => router.dismissTo({ pathname: '/entry/[id]', params: { id } });
  const retry = () => {
    setFailed(false);
    setStage('transcribing');
    setAttempt((n) => n + 1);
  };

  return (
    <Screen style={styles.screen}>
      <IconButton icon="close" label="Close" size={30} onPress={close} />

      <View style={styles.hero}>
        <View style={styles.check}>
          <Glow size={150} opacity={0.4} style={styles.checkGlow} />
          <Icon name={problem ? 'mic' : 'check'} size={58} color={colors.accent} strokeWidth={2.6} />
        </View>
        <Text variant="hand" style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
          {empty ? 'Nothing to save' : failed ? 'That one got away' : ready ? 'Update saved!' : 'Saving update...'}
        </Text>
      </View>

      {problem ? (
        <Card style={styles.summary} accessibilityLiveRegion="polite">
          <Text variant="body" color="textSoft" style={styles.quote}>
            {empty
              ? 'I couldn’t hear anything in that recording, so nothing was saved.'
              : 'Your update couldn’t be saved just now. Nothing was lost; give it another go.'}
          </Text>
        </Card>
      ) : (
        <Card style={styles.steps}>
          {STEPS.map((s, i) => (
            <ProgressStep key={s.label} bare label={s.label} status={stepStatus(i, done)} leadingCheck={s.glyph} />
          ))}
        </Card>
      )}

      {ready && (
        <Card style={styles.summary}>
          <Text variant="heading" style={styles.summaryTitle}>
            What you said
          </Text>
          <Text variant="body" color="textSoft" style={styles.quote}>
            “{summary}”
          </Text>
        </Card>
      )}

      {empty ? (
        <Button
          label="Record again"
          icon="mic"
          style={styles.cta}
          onPress={() => router.replace({ pathname: '/update', params: { id } })}
        />
      ) : failed ? (
        <Button label="Try again" style={styles.cta} onPress={retry} />
      ) : (
        <Button label="Nice. Keep going" icon="arrow-right" disabled={!ready} style={styles.cta} onPress={close} />
      )}
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
