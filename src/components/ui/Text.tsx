import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type ColorToken, isHandVariant, typography, type TypographyVariant, useTheme } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const hand = isHandVariant(variant);
  // Handwritten headline words keep the exact brand cyan in both themes; small cyan text uses a darker teal on light.
  const tint = color === 'accent' && !hand ? colors.accentText : colors[color];
  return (
    <RNText
      // Handwritten headlines are placed by hand, so they keep their size; body text may grow but is capped.
      maxFontSizeMultiplier={hand ? 1 : 1.3}
      style={[
        typography[variant],
        { color: tint },
        hand && {
          textShadowColor: tint,
          textShadowRadius: 1,
          textShadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
      {...rest}
    />
  );
}
