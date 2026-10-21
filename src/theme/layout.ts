export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
/**
 * Corner radii. Use these instead of numeric literals so the whole app stays consistent.
 * - `tile`: small icon tiles and step icons
 * - `cardSm`: tight, stacked rows (list rows, summary cards, audio strip)
 * - `card`: standard cards
 * - `button`: large buttons (rounded, not fully pill-shaped)
 * - `pill`: chips, search, tabs, icon buttons
 */
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, tile: 14, cardSm: 18, card: 22, button: 24, pill: 999 } as const;
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
