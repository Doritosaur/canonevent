import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme';
import { MASCOT_ART } from './mascotArt';
import { MASCOT_OUTLINE } from './mascotOutline';

export type MascotPose = keyof typeof MASCOT_ART;

export type MascotProps = {
  pose: MascotPose;
  /** Rendered width in dp; height follows the artwork's aspect ratio. Vector, so any size stays crisp. */
  width: number;
};

/** Outline thickness in artwork units; centred on a smoothed copy of each shape's edge. */
const OUTLINE = 6;

/** Room around the art so the outline is never clipped at the edge. */
const PAD = OUTLINE;

/**
 * The sunglasses mascot as vector art, traced from the design mockup.
 *
 * Poses: `crawl` (red party hat, onboarding), `cat` (hand on chin, recording), `laptop` (processing),
 * `lying` (blue party hat, processing footer), `celebrate` (arms up with sparkles, saved),
 * `lean` (update outcome), `think` (ask).
 *
 * The art is white, so on the light theme a smooth dark outline is drawn around each shape to keep it visible.
 */
export function Mascot({ pose, width }: MascotProps) {
  const { colors, scheme } = useTheme();
  const art = MASCOT_ART[pose];
  const outlined = scheme === 'light';
  const w = art.width + PAD * 2;
  const h = art.height + PAD * 2;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height: (width * h) / w }}>
      <Svg width="100%" height="100%" viewBox={`${-PAD} ${-PAD} ${w} ${h}`}>
        {art.layers.map((layer) => (
          <Path key={layer.fill} d={layer.d} fill={layer.fill} fillRule="evenodd" />
        ))}
        {outlined && (
          <Path
            d={MASCOT_OUTLINE[pose]}
            fill="none"
            stroke={colors.text}
            strokeWidth={OUTLINE}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
}
