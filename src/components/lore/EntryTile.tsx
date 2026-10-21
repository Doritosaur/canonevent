import { View } from 'react-native';

import { Icon } from '@/components/ui';
import type { IconName } from '@/data/types';
import { type ColorToken, useTheme } from '@/theme';

export type EntryTileProps = {
  icon: IconName;
  tint: ColorToken;
  size?: number;
};

/** Two-tone app-icon tile: dark tinted square holding a bright rounded glyph plate. */
export function EntryTile({ icon, tint, size = 56 }: EntryTileProps) {
  const { colors } = useTheme();
  const plate = size * 0.72;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        backgroundColor: `${colors[tint]}38`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: plate,
          height: plate,
          borderRadius: plate * 0.3,
          backgroundColor: colors[tint],
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={icon} size={plate * 0.6} color={colors.onTone} strokeWidth={2.4} />
      </View>
    </View>
  );
}
