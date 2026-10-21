import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputInstance,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { fontFamily, hitSlop, type Palette, radius, spacing, useTheme } from '@/theme';
import { Icon } from './Icon';

export type SearchBarProps = Omit<TextInputProps, 'style'> & {
  /** Style for the outer container. */
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  style,
  value,
  defaultValue,
  onChangeText,
  onFocus,
  onBlur,
  ...rest
}: SearchBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  // Mirrors the text so the clear button also works when the input is uncontrolled.
  const [inner, setInner] = useState(defaultValue ?? '');
  const text = value ?? inner;

  const handleChange = (next: string) => {
    setInner(next);
    onChangeText?.(next);
  };

  const clear = () => {
    inputRef.current?.clear();
    handleChange('');
    inputRef.current?.focus();
  };

  return (
    <Pressable
      accessible={false}
      onPress={() => inputRef.current?.focus()}
      style={[styles.wrap, focused && styles.focused, style]}>
      <Icon name="search" size={20} color={focused ? colors.accent : colors.textMuted} />
      <TextInput
        ref={inputRef}
        accessibilityLabel="Search"
        placeholder="Search your lore..."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        defaultValue={defaultValue}
        onChangeText={handleChange}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={styles.input}
        {...rest}
      />
      {text.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={hitSlop} onPress={clear}>
          <Icon name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  // No outline: the lifted fill alone marks focus.
  focused: { backgroundColor: colors.surfaceFocus },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    paddingVertical: spacing.sm,
    // Container draws the focus ring; suppress the browser's default outline on web.
    ...({ outlineStyle: 'none' } as object),
  },
});
