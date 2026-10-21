import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Palette, spacing, useTheme } from '@/theme';

export type ScreenProps = ViewProps & {
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Skip the bottom inset when a tab bar already handles it. */
  hasTabBar?: boolean;
};

export function Screen({ scroll = false, hasTabBar = false, style, children, ...rest }: ScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.sm,
    paddingBottom: hasTabBar ? 0 : insets.bottom + spacing.lg,
  };

  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, padding, style]}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.root, styles.content, padding, style]} {...rest}>
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg },
});
