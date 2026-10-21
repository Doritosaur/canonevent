import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Glow } from '@/components/ui';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { inOutQuad } from '@/lib/easing';
import { type Palette, useTheme } from '@/theme';

export type WaveformProps = {
  /** Animate the bars (recording / playing). Static when false. */
  active?: boolean;
  /** Live input level, 0–1. When given, the whole waveform swells and settles with the voice. */
  level?: number;
  /** Maximum bar height in dp. */
  height?: number;
};

const BAR_WIDTH = 2.5;
const BAR_GAP = 2.5;
const SIDE_MARGIN = 20;
const MAX_BARS = 160;

/** Three soft lobes, like the mockup: tall in the middle, smaller either side, thin tails. */
const LOBES = [
  { at: 0.2, width: 0.09, amp: 0.78 },
  { at: 0.5, width: 0.1, amp: 1 },
  { at: 0.8, width: 0.09, amp: 0.7 },
];

function envelope(t: number): number {
  const lobes = LOBES.reduce((sum, l) => sum + l.amp * Math.exp(-((t - l.at) ** 2) / (2 * l.width ** 2)), 0);
  return Math.min(1, 0.04 + lobes);
}

/** Deterministic per-bar jitter so the profile never changes between renders. */
const jitter = (i: number) => 0.72 + 0.28 * Math.abs(Math.sin(i * 12.9898));

export function Waveform({ active = false, level, height = 140 }: WaveformProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const count = Math.min(MAX_BARS, Math.max(8, Math.floor((width - SIDE_MARGIN * 2) / (BAR_WIDTH + BAR_GAP))));
  const heights = useMemo(
    () => Array.from({ length: count }, (_, i) => Math.max(3, height * envelope(i / (count - 1)) * jitter(i))),
    [count, height],
  );
  const [scales] = useState(() => Array.from({ length: MAX_BARS }, () => new Animated.Value(1)));
  const [amp] = useState(() => new Animated.Value(1));

  // Per-bar shimmer: keeps the wave alive even when the mic reports a steady level.
  useEffect(() => {
    if (!active || reduced) {
      scales.forEach((s) => s.setValue(1));
      return;
    }
    const loops = scales.slice(0, count).map((s, i) => {
      const low = 0.4 + (i % 4) * 0.1;
      const duration = 320 + (i % 6) * 80;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(s, { toValue: low, duration, easing: inOutQuad, useNativeDriver: true }),
          Animated.timing(s, { toValue: 1, duration, easing: inOutQuad, useNativeDriver: true }),
        ]),
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, reduced, scales, count]);

  // Overall swell follows the live level.
  useEffect(() => {
    if (level === undefined) {
      amp.setValue(1);
      return;
    }
    Animated.timing(amp, { toValue: 0.22 + 0.78 * level, duration: 90, useNativeDriver: true }).start();
  }, [level, amp]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={active ? 'Audio waveform, listening' : 'Audio waveform'}
      style={{ height }}>
      <Glow size={width} height={height * 1.7} opacity={0.2} style={{ top: -height * 0.35 }} />
      <Animated.View style={[styles.row, { height, transform: [{ scaleY: amp }] }]}>
        {heights.map((h, i) => (
          <Animated.View key={i} style={[styles.bar, { height: h, transform: [{ scaleY: scales[i] }] }]} />
        ))}
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: BAR_GAP },
  bar: { width: BAR_WIDTH, borderRadius: BAR_WIDTH, backgroundColor: colors.wave },
});
