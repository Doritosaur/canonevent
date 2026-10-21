import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NavIconName = 'home' | 'insights' | 'ask' | 'profile' | 'mic';

export type NavIconProps = {
  name: NavIconName;
  /** Filled when active, outlined otherwise. */
  active?: boolean;
  color: string;
  /** Colour of cut-outs (the chat bubble's eyes) when filled. Defaults to the bar background. */
  cutout?: string;
  size?: number;
};

const STROKE = 1.9;

/** Hand-drawn 24×24 icon set for the bottom bar. Decorative: the tab supplies the accessible label. */
export function NavIcon({ name, active = false, color, cutout = '#05090B', size = 27 }: NavIconProps) {
  const fill = active ? color : 'none';
  const line = { stroke: color, strokeWidth: STROKE, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <Path
          d="M3.5 11.2 L11.2 4.1 a1.1 1.1 0 0 1 1.6 0 L20.5 11.2 V19.4 a1.6 1.6 0 0 1 -1.6 1.6 H15.2 V14.8 H8.8 V21 H5.1 a1.6 1.6 0 0 1 -1.6 -1.6 Z"
          fill={fill}
          {...line}
        />
      )}

      {name === 'insights' && (
        <>
          <Rect transform="translate(4.2 12.2)" width={3.6} height={7.6} rx={1.1} fill={fill} {...line} strokeWidth={1.6} />
          <Rect transform="translate(10.2 4.2)" width={3.6} height={15.6} rx={1.1} fill={fill} {...line} strokeWidth={1.6} />
          <Rect transform="translate(16.2 8.7)" width={3.6} height={11.1} rx={1.1} fill={fill} {...line} strokeWidth={1.6} />
        </>
      )}

      {name === 'ask' && (
        <>
          <Path
            d="M12 3.4 C7.1 3.4 3.2 6.9 3.2 11.2 c0 2.1 0.9 4 2.5 5.4 L5 20.6 l4.1 -1.9 c0.9 0.2 1.9 0.4 2.9 0.4 4.9 0 8.8 -3.5 8.8 -7.9 S16.9 3.4 12 3.4 Z"
            fill={fill}
            {...line}
          />
          <Circle cx={8.9} cy={11.3} r={1.25} fill={active ? cutout : color} />
          <Circle cx={15.1} cy={11.3} r={1.25} fill={active ? cutout : color} />
        </>
      )}

      {name === 'profile' && (
        <>
          <Circle cx={12} cy={7.8} r={3.9} fill={fill} {...line} />
          <Path
            d="M4.2 20.6 c0 -4.1 3.4 -6.4 7.8 -6.4 s7.8 2.3 7.8 6.4 a0.9 0.9 0 0 1 -0.9 0.9 H5.1 a0.9 0.9 0 0 1 -0.9 -0.9 Z"
            fill={fill}
            {...line}
          />
        </>
      )}

      {name === 'mic' && (
        <>
          <Rect transform="translate(8.6 2.8)" width={6.8} height={12.2} rx={3.4} fill={color} />
          <Path d="M5.4 11.4 a6.6 6.6 0 0 0 13.2 0" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M12 18 V21.2 M8.6 21.2 H15.4" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}
