import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { IconButton, type IconButtonProps } from './IconButton';
import { Text } from './Text';

type HeaderAction = Pick<IconButtonProps, 'icon' | 'label' | 'onPress'>;

export type ScreenHeaderProps = {
  title?: string;
  left?: HeaderAction;
  right?: HeaderAction;
};

export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>{left && <IconButton {...left} />}</View>
      {title && (
        <Text variant="heading" numberOfLines={1} accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      )}
      <View style={[styles.side, styles.right]}>{right && <IconButton {...right} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginBottom: spacing.md },
  side: { width: 44 },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
