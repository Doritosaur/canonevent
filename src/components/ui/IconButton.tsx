import { useMemo } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { hitSlop, type Palette, radius, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';

export type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: IconName;
  /** Required: icon-only controls need an accessible name. */
  label: string;
  size?: number;
};

export function IconButton({ icon, label, size = 22, style, ...rest }: IconButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hitSlop}
      style={(state) => [
        styles.base,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <Icon name={icon} size={size} color={colors.text} />
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  base: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: colors.surfaceRaised },
});
