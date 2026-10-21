import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import type { IconName } from '@/data/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { type ColorToken, type Palette, radius, spacing, useTheme } from '@/theme';

export type StepStatus = 'pending' | 'active' | 'done';

export type ProgressStepProps = {
  label: string;
  status: StepStatus;
  /** Leading icon in a tinted tile (processing screen). */
  icon?: IconName;
  tint?: ColorToken;
  /** Render without its own card, for lists inside a shared card. */
  bare?: boolean;
  /** Replaces the status indicator with a filled cyan icon on the left (outcome screen). */
  leadingCheck?: IconName;
  /** When set, the row fades and slides in on mount after this many milliseconds. */
  enterDelay?: number;
  /** Tighter rows for small screens. */
  compact?: boolean;
};

const statusLabel: Record<StepStatus, string> = {
  pending: 'pending',
  active: 'in progress',
  done: 'done',
};

export function ProgressStep({
  label,
  status,
  icon,
  tint = 'accent',
  bare = false,
  leadingCheck,
  enterDelay,
  compact = false,
}: ProgressStepProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const reduced = useReducedMotion();
  const animate = enterDelay !== undefined && !reduced;
  const [enter] = useState(() => new Animated.Value(animate ? 0 : 1));

  useEffect(() => {
    if (!animate) return;
    Animated.timing(enter, { toValue: 1, duration: 320, delay: enterDelay, useNativeDriver: true }).start();
  }, [animate, enter, enterDelay]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={`${label}, ${statusLabel[status]}`}
      style={[
        styles.row,
        !bare && styles.card,
        compact && !bare && styles.cardCompact,
        status === 'pending' && !bare && styles.dim,
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}>
      {icon && (
        <View style={[styles.tile, compact && styles.tileCompact, { backgroundColor: `${colors[tint]}1F` }]}>
          <Icon name={icon} size={26} color={colors[tint]} />
        </View>
      )}
      {leadingCheck && (
        <View style={[styles.check, status !== 'done' && styles.checkIdle]}>
          <Icon name={status === 'done' ? 'check' : leadingCheck} size={18} color={colors.onAccent} strokeWidth={3} />
        </View>
      )}
      <Text variant="body" color="textSoft" style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>
      {!leadingCheck && (
        <View style={styles.indicator}>
          {status === 'done' && (
            <View style={styles.done}>
              <Icon name="check" size={18} color={colors.onAccent} strokeWidth={3} />
            </View>
          )}
          {status === 'active' && <ActivityIndicator color={colors.accent} />}
          {status === 'pending' && <View style={styles.ring} />}
        </View>
      )}
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 44 },
  card: {
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.cardSm,
    backgroundColor: colors.stepCard,
  },
  cardCompact: { minHeight: 54, paddingHorizontal: spacing.md, gap: spacing.sm + 2 },
  dim: { opacity: 0.85 },
  tile: { width: 50, height: 50, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  tileCompact: { width: 36, height: 36 },
  label: { flex: 1, fontSize: 17 },
  labelCompact: { fontSize: 14 },
  indicator: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  done: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { width: 30, height: 30, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.ring },
  check: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIdle: { opacity: 0.55 },
});
