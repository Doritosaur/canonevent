import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { type Palette, radius, spacing, useTheme } from '@/theme';

export type QuestionRowProps = {
  question: string;
  onPress?: () => void;
  onLongPress?: () => void;
};

/** A question asked before, shown in the recent list on "Ask your past self". */
export function QuestionRow({ question, onPress, onLongPress }: QuestionRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text variant="body" color="textSoft" numberOfLines={1} style={styles.text}>
        {question}
      </Text>
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
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.cardSm,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  text: { flex: 1, fontSize: 14 },
});
