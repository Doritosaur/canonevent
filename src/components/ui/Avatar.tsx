import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { initials } from '@/data/profile';
import { type Palette, useTheme } from '@/theme';
import { Text } from './Text';

export type AvatarProps = { name: string; uri?: string; size?: number };

/** Profile photo, or the user's initials when there isn't one. */
export function Avatar({ name, uri, size = 96 }: AvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.base, box]} accessibilityLabel={`${name || 'Your'} avatar`}>
      {uri ? (
        <Image source={{ uri }} style={box} />
      ) : (
        <Text variant="title" color="onAccent" style={{ fontSize: size * 0.35, lineHeight: size * 0.42, letterSpacing: 1 }}>
          {initials(name) || '?'}
        </Text>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  });
