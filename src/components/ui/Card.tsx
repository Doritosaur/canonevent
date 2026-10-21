import { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={[styles.card, style]} {...rest} />;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
});
