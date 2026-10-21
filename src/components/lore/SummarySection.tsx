import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import type { IconName } from '@/data/types';
import { type ColorToken, fontFamily, type Palette, radius, spacing, useTheme } from '@/theme';
import { EntryTile } from './EntryTile';

export type SummarySectionProps = {
  /** e.g. "What happened?" */
  title: string;
  body: string;
  icon: IconName;
  tint: ColorToken;
  /** When provided, the body is always an editable field: tap it (or the pencil) to type. */
  onChangeBody?: (text: string) => void;
};

export function SummarySection({ title, body, icon, tint, onChangeBody }: SummarySectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.row} accessible={!onChangeBody} accessibilityLabel={`${title} ${body}`}>
      <EntryTile icon={icon} tint={tint} size={52} />
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text variant="bodyStrong" style={styles.title}>
            {title}
          </Text>
          {onChangeBody && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${title}`}
              hitSlop={12}
              onPress={() => input.current?.focus()}>
              <Icon name="edit" size={16} color={focused ? colors.accent : colors.textMuted} />
            </Pressable>
          )}
        </View>
        {onChangeBody ? (
          <TextInput
            ref={input}
            accessibilityLabel={title}
            multiline
            submitBehavior="blurAndSubmit"
            returnKeyType="done"
            textAlignVertical="top"
            value={body}
            onChangeText={onChangeBody}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={colors.accent}
            style={[styles.input, focused && styles.inputFocused]}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 17, lineHeight: 24, flexShrink: 1 },
  body: { fontSize: 15, lineHeight: 22 },
  // The border is always present (neutral until focused) so focusing never shifts the layout.
  input: {
    minHeight: 96,
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    ...({ outlineStyle: 'none' } as object),
  },
  inputFocused: { borderColor: colors.accent },
});
