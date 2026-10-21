import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Glow, Icon } from '@/components/ui';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { outQuad } from '@/lib/easing';
import { type Palette, useTheme } from '@/theme';

export type RecordButtonProps = {
  recording?: boolean;
  onPress?: () => void;
  /** Hold-to-talk support. */
  onPressIn?: () => void;
  onPressOut?: () => void;
  size?: number;
  /** Overrides the default "Start recording" / "Stop recording" name. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const RING = 3;
const GAP = 7;

/** Cyan disc inside a thin ring with a soft glow; the ring pulses outwards while recording. */
export function RecordButton({
  recording = false,
  onPress,
  onPressIn,
  onPressOut,
  size = 120,
  accessibilityLabel,
  accessibilityHint,
}: RecordButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const inner = size - 2 * (RING + GAP);
  const reduced = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!recording || reduced) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1500, easing: outQuad, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [recording, reduced, pulse]);

  const buzz = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Glow size={size * 2.1} opacity={0.5} style={{ left: -size * 0.55, top: -size * 0.55 }} />
      {recording && !reduced && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
            },
          ]}
        />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (recording ? 'Stop recording' : 'Start recording')}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ busy: recording }}
        onPress={() => {
          buzz();
          onPress?.();
        }}
        onPressIn={() => {
          if (onPressIn) buzz();
          onPressIn?.();
        }}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.ring,
          { width: size, height: size, borderRadius: size / 2 },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {recording ? (
            <View style={styles.stop} />
          ) : (
            <Icon name="mic" size={inner * 0.46} color={colors.onAccent} strokeWidth={2.4} />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: RING,
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  pulse: { position: 'absolute', borderWidth: 2, borderColor: colors.accent },
  pressed: { transform: [{ scale: 0.97 }] },
  inner: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  stop: { width: 24, height: 24, borderRadius: 5, backgroundColor: colors.onAccent },
});
