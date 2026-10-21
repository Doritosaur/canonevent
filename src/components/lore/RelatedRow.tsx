import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import type { Entry } from '@/data/types';
import { formatDate } from '@/lib/format';
import { type Palette, radius, spacing, useTheme } from '@/theme';
import { EntryTile } from './EntryTile';

export type RelatedRowProps = {
  entry: Entry;
  /** e.g. "big purchase" */
  reason: string;
  onPress?: () => void;
};

export function RelatedRow({ entry, reason, onPress }: RelatedRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <EntryTile icon={entry.icon} tint={entry.tint} size={52} />
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {entry.title}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {formatDate(entry.date)} · Similar: {reason}
        </Text>
      </View>
      <Icon name="chevron" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.cardSm,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  body: { flex: 1, gap: 2 },
});
