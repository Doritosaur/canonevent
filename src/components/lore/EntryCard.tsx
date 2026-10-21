import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import type { IconName, Outcome } from '@/data/types';
import { type ColorToken, fontFamily, type Palette, radius, spacing, useTheme } from '@/theme';
import { EntryTile } from './EntryTile';

const outcomeFace: Record<Outcome, { name: IconName; color: ColorToken; label: string }> = {
  bad: { name: 'sad', color: 'danger', label: 'Went badly' },
  mixed: { name: 'neutral', color: 'warning', label: 'Mixed result' },
  good: { name: 'happy', color: 'success', label: 'Went well' },
};

export type EntryCardProps = {
  title: string;
  date: string;
  summary: string;
  outcome: Outcome;
  /** Category icon + tint shown in the leading tile. */
  icon: IconName;
  tint: ColorToken;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function EntryCard({ title, date, summary, outcome, icon, tint, onPress, onLongPress }: EntryCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const face = outcomeFace[outcome];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${date}. ${face.label}.`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <EntryTile icon={icon} tint={tint} size={58} />
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" color="textMuted">
          {date}
        </Text>
        <Text variant="body" color="textMuted" numberOfLines={2} style={styles.summary}>
          {summary}
        </Text>
      </View>
      <Icon name={face.name} size={32} color={colors[face.color]} strokeWidth={1.8} />
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  body: { flex: 1, gap: 1 },
  title: { fontFamily: fontFamily.semibold, fontSize: 16 },
  summary: { fontSize: 15, lineHeight: 21 },
});
