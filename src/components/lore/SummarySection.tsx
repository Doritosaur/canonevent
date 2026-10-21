import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import type { IconName } from '@/data/types';
import { type ColorToken, fontFamily, type Palette, radius, spacing, useTheme } from '@/theme';
import { EntryTile } from './EntryTile';

export type SummarySectionProps = {
  /** e.g. "What happened?" */
  title: string;
  body: string;
  icon: IconName;
  tint: ColorToken;
  /** When provided, the body becomes an editable field. */
  onChangeBody?: (text: string) => void;
};

export function SummarySection({ title, body, icon, tint, onChangeBody }: SummarySectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row} accessible={!onChangeBody} accessibilityLabel={`${title} ${body}`}>
      <EntryTile icon={icon} tint={tint} size={52} />
      <View style={styles.text}>
        <Text variant="bodyStrong" style={styles.title}>
          {title}
        </Text>
        {onChangeBody ? (
          <TextInput
            accessibilityLabel={title}
            multiline
            value={body}
            onChangeText={onChangeBody}
            selectionColor={colors.accent}
            style={styles.input}
          />
        ) : (
          <Text variant="body" color="textMuted" style={styles.body}>
            {body}
          </Text>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  text: { flex: 1 },
  title: { fontSize: 17, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  input: {
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
    ...({ outlineStyle: 'none' } as object),
  },
});
