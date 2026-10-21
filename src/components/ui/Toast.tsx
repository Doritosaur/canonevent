import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { darkPalette, type Palette, radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

type ToastOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Milliseconds before it hides itself. */
  duration?: number;
};

type ToastContextValue = { show: (options: ToastOptions) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Bottom toast with an optional action (e.g. Undo). One at a time; a new one replaces the old. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [progress] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [progress]);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(options);
      // `accessibilityLiveRegion` is Android-only; this makes VoiceOver read the message too.
      AccessibilityInfo.announceForAccessibility(options.message);
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, options.duration ?? 4500);
    },
    [hide, progress],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 92,
              opacity: progress,
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}>
          <Text variant="label" color="onToast" style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.actionLabel && (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => {
                toast.onAction?.();
                hide();
              }}>
              <Text variant="label" style={{ color: darkPalette.accent }}>
                {toast.actionLabel}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.cardSm,
    backgroundColor: colors.toast,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: { flex: 1 },
});
