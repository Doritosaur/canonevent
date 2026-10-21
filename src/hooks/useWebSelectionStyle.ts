import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Web only: replaces the browser's default blue text selection with a soft accent tint.
 * (On iOS and Android `selectionColor` on the input already does this.)
 */
export function useWebSelectionStyle() {
  const { colors, scheme } = useTheme();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const highlight = scheme === 'dark' ? 'rgba(99, 250, 253, 0.28)' : 'rgba(0, 122, 132, 0.2)';
    const style = document.createElement('style');
    style.setAttribute('data-canon-selection', '');
    style.textContent = `::selection { background: ${highlight}; color: ${colors.text}; } input, textarea { caret-color: ${colors.accentText}; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [colors, scheme]);
}
