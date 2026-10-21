import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Palette, radius, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type SheetAction = {
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
};

export type ActionSheetProps = {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
};

/** Bottom sheet of actions. Used instead of `Alert` so it looks the same on every platform. */
export function ActionSheet({ visible, title, actions, onClose }: ActionSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={onClose}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          {/* Absorb taps so only the backdrop closes the sheet. */}
          <Pressable accessible={false}>
            <View style={styles.grabber} />
            {title && (
              <Text variant="label" color="textMuted" numberOfLines={1} style={styles.title}>
                {title}
              </Text>
            )}
            {actions.map((a) => (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <Icon name={a.icon} size={22} color={a.destructive ? colors.danger : colors.text} />
                <Text variant="bodyStrong" color={a.destructive ? 'danger' : 'text'}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
});
