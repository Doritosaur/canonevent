import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** In-app confirmation modal. Used instead of `Alert` so it looks the same on every platform, web included. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      {/* The backdrop must not be an accessible element, or screen readers treat the dialog as part of it. */}
      <Pressable accessible={false} style={styles.backdrop} onPress={onCancel}>
        {/* Absorb taps so only the backdrop dismisses the dialog. */}
        <Pressable
          accessible={false}
          accessibilityViewIsModal
          onAccessibilityEscape={onCancel}
          style={styles.dialog}>
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" color="textMuted">
            {message}
          </Text>
          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} />
            <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    dialog: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: radius.card + 4,
      padding: spacing.xl,
      gap: spacing.md,
    },
    actions: { gap: spacing.sm, marginTop: spacing.md },
  });
