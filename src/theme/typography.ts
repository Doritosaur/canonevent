import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  hand: 'PatrickHand_400Regular',
} as const;

export const typography = {
  /** Handwritten, largest: the "Canon Event" wordmark. */
  display: { fontFamily: fontFamily.hand, fontSize: 70, lineHeight: 74 },
  /** Handwritten screen headlines ("Spill the lore...", "Added to your lore!"). */
  handLg: { fontFamily: fontFamily.hand, fontSize: 48, lineHeight: 50 },
  /** Handwritten secondary headlines ("Turning your ramblings...", "Update saved!"). */
  hand: { fontFamily: fontFamily.hand, fontSize: 34, lineHeight: 37 },
  /** Handwritten asides ("just ramble it's fine."). */
  note: { fontFamily: fontFamily.hand, fontSize: 24, lineHeight: 26 },

  title: { fontFamily: fontFamily.bold, fontSize: 30, lineHeight: 36 },
  heading: { fontFamily: fontFamily.bold, fontSize: 19, lineHeight: 26 },
  bodyStrong: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 23 },
  caption: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 19 },
  label: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Handwritten faces only ship in one weight, so a faint same-colour halo thickens strokes to match the mockup. */
export const isHandVariant = (v: TypographyVariant) =>
  v === 'display' || v === 'handLg' || v === 'hand' || v === 'note';
