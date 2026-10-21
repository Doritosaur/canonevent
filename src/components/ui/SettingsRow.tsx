import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type SettingsRowProps = {
  icon: IconName;
  label: string;
  /** Muted line under the label. */
  hint?: string;
  /** Red label and icon for destructive actions. */
  destructive?: boolean;
  /** Show a trailing chevron (navigation-style rows). */
  chevron?: boolean;
  onPress?: () => void;
};

/** One tappable row in a settings list: tinted icon tile, label, optional hint. */
export function SettingsRow({ icon, label, hint, destructive = false, chevron = false, onPress }: SettingsRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const tint = destructive ? colors.danger : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.tile, { backgroundColor: destructive ? `${colors.danger}22` : colors.surfaceRaised }]}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View style={styles.text}>
        <Text variant="bodyStrong" color={destructive ? 'danger' : 'text'}>
          {label}
        </Text>
        {hint && (
          <Text variant="caption" color="textMuted">
            {hint}
          </Text>
        )}
      </View>
      {chevron && <Icon name="chevron" size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 64,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    pressed: { backgroundColor: colors.surfaceRaised },
    tile: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    text: { flex: 1, gap: 2 },
  });
