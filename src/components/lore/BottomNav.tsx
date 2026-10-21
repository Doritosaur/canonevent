import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glow, Text } from '@/components/ui';
import { type Palette, spacing, useTheme } from '@/theme';
import { NavIcon, type NavIconName } from './NavIcons';

export type NavItem = {
  key: string;
  label: string;
  icon: NavIconName;
};

export type BottomNavProps = {
  /** Four items; the record action sits between the first two and last two. */
  items: [NavItem, NavItem, NavItem, NavItem];
  activeKey: string;
  onSelect: (key: string) => void;
  onRecord: () => void;
};

export function BottomNav({ items, activeKey, onSelect, onRecord }: BottomNavProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const renderItem = (item: NavItem) => {
    const active = item.key === activeKey;
    // Same brand cyan in both themes.
    const tint = active ? colors.accent : colors.navInactive;
    return (
      <Pressable
        key={item.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => onSelect(item.key)}
        style={styles.item}>
        <NavIcon name={item.icon} active={active} color={tint} cutout={colors.navBar} />
        <Text variant="label" style={[styles.label, { color: tint }]}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {items.slice(0, 2).map(renderItem)}
      <View style={styles.item}>
        <View style={styles.fabWrap}>
          <Glow size={120} opacity={0.42} style={styles.fabGlow} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record"
            onPress={onRecord}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
            <NavIcon name="mic" color={colors.onAccent} size={28} />
          </Pressable>
        </View>
      </View>
      {items.slice(2).map(renderItem)}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    backgroundColor: colors.navBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: spacing.xs },
  label: { fontSize: 14, lineHeight: 18 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  fabWrap: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  fabGlow: { left: -31, top: -31 },
  fabPressed: { backgroundColor: colors.accentPressed },
});
