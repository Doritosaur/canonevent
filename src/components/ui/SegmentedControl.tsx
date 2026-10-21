import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

export type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[styles.segment, selected && styles.selected]}>
            <Text variant="label" color={selected ? 'onAccent' : 'text'}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  scroll: { flexGrow: 0, borderRadius: radius.pill, backgroundColor: colors.segment },
  row: { flexGrow: 1, flexDirection: 'row', gap: spacing.xs, padding: spacing.xs },
  segment: {
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  selected: { backgroundColor: colors.accent },
});
