import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SummarySection } from '@/components/lore';
import { Button, Card, Chip, Icon, IconButton, Screen, Text } from '@/components/ui';
import type { Draft } from '@/data/types';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

/** Screen 5: Review & save. */
export default function Review() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { draft, setDraft, addEntry } = useLore();
  const [fields, setFields] = useState<Draft | null>(draft);
  const [editing, setEditing] = useState(false);

  if (!fields) return <Redirect href="/(tabs)" />;

  const set = (key: 'happened' | 'thinking' | 'learned') => (text: string) =>
    setFields((f) => (f ? { ...f, [key]: text } : f));

  const save = () => {
    const entry = addEntry(fields);
    router.replace({ pathname: '/saved', params: { id: entry.id } });
  };

  const discard = () => {
    setDraft(null);
    router.dismissTo('/(tabs)');
  };

  return (
    <Screen scroll style={styles.content}>
      <IconButton icon="close" label="Discard and close" size={30} onPress={discard} />

      <View style={styles.titleRow}>
        <Text variant="hand" style={styles.title} accessibilityRole="header">
          Here&rsquo;s{' '}
          <Text variant="hand" color="accent">
            what I got
          </Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setEditing((e) => !e)}
          style={({ pressed }) => [styles.edit, pressed && styles.editPressed]}>
          <Icon name={editing ? 'check' : 'edit'} size={18} color={colors.accent} />
          <Text variant="bodyStrong">{editing ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>

      <View style={styles.cards}>
        <Card style={styles.card}>
          <SummarySection
            title="What happened?"
            body={fields.happened}
            icon="dollar"
            tint="success"
            onChangeBody={editing ? set('happened') : undefined}
          />
        </Card>
        <Card style={styles.card}>
          <SummarySection
            title="What were you thinking?"
            body={fields.thinking}
            icon="chat"
            tint="purple"
            onChangeBody={editing ? set('thinking') : undefined}
          />
        </Card>
        <Card style={styles.card}>
          <SummarySection
            title="What did you learn?"
            body={fields.learned}
            icon="bulb"
            tint="warning"
            onChangeBody={editing ? set('learned') : undefined}
          />
        </Card>
      </View>

      <View style={styles.tags}>
        {fields.tags.map((t, i) => (
          <Chip key={t} label={t} teal={i < 2} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Save to lore" icon="arrow-right" onPress={save} disabled={editing} />
        <Button label="Discard" variant="secondary" onPress={discard} style={styles.discard} />
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: spacing.xxl },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  title: { fontSize: 37, lineHeight: 42, flex: 1 },
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  editPressed: { backgroundColor: colors.surfaceRaised },
  cards: { gap: 5, marginTop: spacing.lg },
  card: { borderRadius: radius.cardSm, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  actions: { gap: spacing.md, marginTop: spacing.lg },
  discard: { backgroundColor: colors.surface, borderWidth: 0 },
});
