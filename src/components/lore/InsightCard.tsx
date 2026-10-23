import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { type Palette, radius, spacing, useTheme } from '@/theme';

export type InsightTone = 'danger' | 'purple' | 'info' | 'success';

const TONE_KEY = {
  danger: 'toneDanger',
  purple: 'tonePurple',
  info: 'toneInfo',
  success: 'toneSuccess',
} as const satisfies Record<InsightTone, keyof Palette>;

export type InsightCardProps = {
  text: string;
  /** e.g. "Bought a GPU · Mar 12, 2024" */
  meta: string;
  tone: InsightTone;
  icon: IconName;
  onPress?: () => void;
};

/** Longer notes are cut with an ellipsis so the cards stay a similar height; the full text is on the entry. */
const TEXT_LINES = 3;

/** Coloured highlight card. Its text is always white (`onTone`), whichever theme is active. */
export function InsightCard({ text, meta, tone, icon, onPress }: InsightCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(), []);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text} ${meta}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors[TONE_KEY[tone]] }, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Icon name={icon} size={24} color={colors.onTone} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyStrong" color="onTone" numberOfLines={TEXT_LINES}>
          {text}
        </Text>
        <Text variant="caption" color="onTone" numberOfLines={1} style={styles.meta}>
          {meta}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    card: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.card },
    pressed: { opacity: 0.85 },
    icon: { width: 40, alignItems: 'center', paddingTop: 2 },
    body: { flex: 1, gap: spacing.xs },
    meta: { opacity: 0.9 },
  });
