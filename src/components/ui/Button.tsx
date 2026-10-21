import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isPrimary = variant === 'primary';
  const inactive = disabled === true || loading;
  const fg = isPrimary ? colors.onAccent : variant === 'light' ? colors.onInverse : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && (isPrimary ? styles.primaryPressed : variant === 'light' ? styles.lightPressed : styles.pressed),
        inactive && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <Text variant="heading" style={{ color: fg, fontSize: 18 }}>
            {label}
          </Text>
          {icon && <Icon name={icon} size={20} color={fg} />}
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  light: { backgroundColor: colors.inverse },
  primaryPressed: { backgroundColor: colors.accentPressed },
  lightPressed: { backgroundColor: colors.inversePressed },
  pressed: { backgroundColor: colors.surfaceRaised },
  disabled: { opacity: 0.5 },
});
