/** Every colour the UI uses. Read it with `useTheme()`; never hard-code hex values in components. */
export type Palette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  /** Slightly lifted fill used to show a focused field. */
  surfaceFocus: string;
  border: string;
  borderStrong: string;

  text: string;
  textSoft: string;
  textMuted: string;
  textFaint: string;

  /** Brand fill: buttons, active states, glows. */
  accent: string;
  accentPressed: string;
  accentSoft: string;
  /** Brand colour for text and thin strokes; darker on light backgrounds so it stays readable. */
  accentText: string;
  /** Glowing waveform bars. */
  wave: string;
  /** Text and icons placed on an accent fill. */
  onAccent: string;

  danger: string;
  warning: string;
  success: string;
  info: string;
  purple: string;

  /** Backgrounds of the coloured insight cards. Text on them is always `onTone`. */
  toneDanger: string;
  tonePurple: string;
  toneInfo: string;
  toneSuccess: string;
  onTone: string;

  chip: string;
  chipTeal: string;
  segment: string;
  stepCard: string;
  navBar: string;
  navInactive: string;
  toast: string;
  onToast: string;
  /** Solid high-contrast button (the white "Ask another question"). */
  inverse: string;
  onInverse: string;
  inversePressed: string;
  scrim: string;

  /** Hand-drawn doodles on the welcome screen. */
  sketch: string;
  sketchDim: string;
  ground: string;
  dot: string;
  ring: string;
};

/** Sampled from the design mockup. */
export const darkPalette: Palette = {
  background: '#010204',
  surface: '#0F1419',
  surfaceRaised: '#171B21',
  surfaceFocus: '#18202A',
  border: '#1E252D',
  borderStrong: '#1B2B33',

  text: '#FFFFFF',
  textSoft: '#D3D9E0',
  textMuted: '#A4AEB9',
  textFaint: '#566170',

  accent: '#63FAFD',
  accentPressed: '#3DDFE3',
  accentSoft: 'rgba(99, 250, 253, 0.12)',
  accentText: '#63FAFD',
  wave: '#14E1EC',
  onAccent: '#031314',

  danger: '#F04462',
  warning: '#F5C84B',
  success: '#13B14D',
  info: '#3B82F6',
  purple: '#9E63EF',

  toneDanger: '#7A1F2B',
  tonePurple: '#3B1F8F',
  toneInfo: '#0F3D8F',
  toneSuccess: '#0F5B45',
  onTone: '#FFFFFF',

  chip: '#171A1F',
  chipTeal: '#0A2A2F',
  segment: '#12161B',
  stepCard: '#0B1017',
  navBar: '#05090B',
  navInactive: '#8392AE',
  toast: '#1A2129',
  onToast: '#FFFFFF',
  inverse: '#FFFFFF',
  onInverse: '#031314',
  inversePressed: '#D9DEE0',
  scrim: 'rgba(0, 0, 0, 0.6)',

  sketch: '#8A97A8',
  sketchDim: '#5C6C8F',
  ground: '#1B2430',
  dot: '#4A5568',
  ring: '#5E6B7D',
};

export const lightPalette: Palette = {
  background: '#F3F6F9',
  surface: '#FFFFFF',
  surfaceRaised: '#EAEFF4',
  surfaceFocus: '#E6ECF2',
  border: '#DCE3EA',
  borderStrong: '#CFD9E2',

  // Deep slate-navy rather than black: still 14:1 on white, but softer.
  text: '#1F2D42',
  textSoft: '#34445A',
  textMuted: '#556275',
  textFaint: '#5F6B7C',

  // The brand cyan is the same in both themes. Only cyan *text* is darkened (it can't be read on white).
  accent: '#63FAFD',
  accentPressed: '#3DDFE3',
  accentSoft: 'rgba(99, 250, 253, 0.25)',
  accentText: '#007A84',
  wave: '#14E1EC',
  onAccent: '#06303A',

  // Each is at least 5:1 against white (as a fill under white text, or as text on white).
  danger: '#C81E3A',
  warning: '#8F5F00',
  success: '#0B7D3A',
  info: '#1D4ED8',
  purple: '#6D28D9',

  toneDanger: '#C81E3A',
  tonePurple: '#6D28D9',
  toneInfo: '#1D4ED8',
  toneSuccess: '#0B7D3A',
  onTone: '#FFFFFF',

  chip: '#E6EBF1',
  chipTeal: '#D2F3F5',
  segment: '#E6EBF1',
  stepCard: '#F0F4F8',
  navBar: '#FFFFFF',
  navInactive: '#5B687B',
  toast: '#1F2933',
  onToast: '#FFFFFF',
  inverse: '#1F2D42',
  onInverse: '#FFFFFF',
  inversePressed: '#34445A',
  scrim: 'rgba(20, 30, 45, 0.45)',

  sketch: '#7C8998',
  sketchDim: '#8A97B5',
  ground: '#CBD5DF',
  dot: '#B6C1CD',
  ring: '#9AA6B4',
};

export type ColorToken = keyof Palette;
