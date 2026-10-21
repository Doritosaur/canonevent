import { useMemo } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  /** Teal-tinted, used for tags the AI extracted. */
  teal?: boolean;
};

/** Filter / tag pill. Non-interactive when `onPress` is omitted. */
export function Chip({ label, selected = false, teal = false, onPress, style, ...rest }: ChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={(state) => [
        styles.base,
        teal && styles.teal,
        selected && styles.selected,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <Text variant="label" color={selected ? 'onAccent' : teal ? 'accent' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  base: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  teal: { backgroundColor: colors.chipTeal },
  selected: { backgroundColor: colors.accent },
});
