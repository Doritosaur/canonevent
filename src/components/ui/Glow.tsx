import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

export type GlowProps = {
  /** Width and height of the glow area in dp. */
  size: number;
  /** Optional different height for oval glows (e.g. behind a waveform). */
  height?: number;
  color?: string;
  /** Peak opacity at the centre. */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A soft radial glow drawn in SVG. Unlike shadow props it renders identically on iOS, Android and web,
 * so glowing buttons and waveforms look the same everywhere. Place it behind the glowing element.
 */
export function Glow({ size, height = size, color: colorProp, opacity = 0.5, style }: GlowProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  const id = `glow-${color.replace('#', '')}-${Math.round(opacity * 100)}`;
  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height }, style]}>
      <Svg width={size} height={height}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.28} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { position: 'absolute' } });
