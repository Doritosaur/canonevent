import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { inOutQuad } from '@/lib/easing';
import { useTheme } from '@/theme';

export type SparkleProps = {
  size?: number;
  color?: string;
  /** Gently pulse in and out. `delay` staggers a group of sparkles. */
  twinkle?: boolean;
  delay?: number;
};

/** Four-point decorative star. */
export function Sparkle({ size = 20, color, twinkle = false, delay = 0 }: SparkleProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!twinkle || reduced) {
      t.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 800, easing: inOutQuad, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 800, easing: inOutQuad, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [twinkle, reduced, delay, t]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={
        twinkle
          ? {
              opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }),
              transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) }],
            }
          : undefined
      }>
      <View>
        <Svg width={size} height={size} viewBox="-12 -12 24 24">
          <Path d="M0 -11 L2.8 -2.8 L11 0 L2.8 2.8 L0 11 L-2.8 2.8 L-11 0 L-2.8 -2.8 Z" fill={color ?? colors.accent} />
        </Svg>
      </View>
    </Animated.View>
  );
}
