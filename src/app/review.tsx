import { Redirect, router, usePreventRemove } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SummarySection } from '@/components/lore';
import { Button, Card, Chip, ConfirmDialog, IconButton, Screen, Text } from '@/components/ui';
import type { Draft } from '@/data/types';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

/** Screen 5: Review & save. */
export default function Review() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { draft, setDraft, addEntry } = useLore();
  const [fields, setFields] = useState<Draft | null>(draft);
  const [blocked, setBlocked] = useState<(() => void) | null>(null);

  const dirty =
    !!fields &&
    !!draft &&
    (fields.happened !== draft.happened || fields.thinking !== draft.thinking || fields.learned !== draft.learned);

  // Covers the X, the Android back button and the iOS swipe-back: all would silently drop the edits.
  const allowLeaving = usePreventRemove(dirty, ({ repeat }) => setBlocked(() => repeat));

  if (!fields) return <Redirect href="/(tabs)" />;

  const set = (key: 'happened' | 'thinking' | 'learned') => (text: string) =>
    setFields((f) => (f ? { ...f, [key]: text } : f));

  const save = () => {
    const entry = addEntry(fields);
    allowLeaving();
    router.replace({ pathname: '/saved', params: { id: entry.id } });
  };

  // Nothing exists server-side until Save, so discarding only has to drop the draft and its recording.
  const dropRecording = () => deleteAudioFiles([draft?.audioUri]);

  const discard = () => {
    if (!dirty) {
      dropRecording();
      setDraft(null);
    }
    router.dismissTo('/(tabs)');
  };

  const confirmDiscard = () => {
    const leave = blocked;
    setBlocked(null);
    dropRecording();
    setDraft(null);
    allowLeaving();
    leave?.();
  };

  return (
    <Screen scroll style={styles.content}>
      <IconButton icon="close" label="Discard and close" size={30} onPress={discard} />

      <Text variant="hand" style={styles.title} accessibilityRole="header">
        Here&rsquo;s{' '}
        <Text variant="hand" color="accent">
          what I got
        </Text>
      </Text>
      <Text variant="caption" color="textMuted" style={styles.hint}>
        Tap any answer to fix it.
      </Text>

      <View style={styles.cards}>
        <Card style={styles.card}>
          <SummarySection
            title="What happened?"
            body={fields.happened}
            icon="dollar"
            tint="success"
            onChangeBody={set('happened')}
          />
        </Card>
        <Card style={styles.card}>
          <SummarySection
            title="What were you thinking?"
            body={fields.thinking}
            icon="chat"
            tint="purple"
            onChangeBody={set('thinking')}
          />
        </Card>
        <Card style={styles.card}>
          <SummarySection
            title="What did you learn?"
            body={fields.learned}
            icon="bulb"
            tint="warning"
            onChangeBody={set('learned')}
          />
        </Card>
      </View>

      <View style={styles.tags}>
        {fields.tags.map((t, i) => (
          <Chip key={t} label={t} teal={i < 2} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Save to lore" icon="arrow-right" onPress={save} />
        <Button label="Discard" variant="secondary" onPress={discard} style={styles.discard} />
      </View>

      <ConfirmDialog
        visible={blocked !== null}
        title="Discard changes?"
        message="Your edits to this summary will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={confirmDiscard}
        onCancel={() => setBlocked(null)}
      />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: spacing.xxl },
  title: { fontSize: 37, lineHeight: 42, marginTop: spacing.sm },
  hint: { marginTop: spacing.xs },
  cards: { gap: 5, marginTop: spacing.lg },
  card: { borderRadius: radius.cardSm, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  actions: { gap: spacing.md, marginTop: spacing.lg },
  discard: { backgroundColor: colors.surface, borderWidth: 0 },
});
