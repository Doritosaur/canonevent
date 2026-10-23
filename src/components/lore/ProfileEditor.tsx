import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, Button, Icon, Text } from '@/components/ui';
import { pickProfilePhoto } from '@/lib/profilePhoto';
import type { Profile } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

type Props = {
  initial: Profile;
  submitLabel: string;
  onSubmit: (profile: Profile) => void;
};

/** Photo + name form shared by onboarding and the edit-profile screen. */
export function ProfileEditor({ initial, submitLabel, onSubmit }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(initial.name);
  const [photoUri, setPhotoUri] = useState(initial.photoUri);
  const trimmed = name.trim();

  const choosePhoto = async () => {
    const uri = await pickProfilePhoto().catch(() => null);
    if (uri) setPhotoUri(uri);
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Change profile photo" style={styles.photo}>
        <Avatar name={trimmed} uri={photoUri} size={120} />
        <View style={styles.badge}>
          <Icon name="edit" size={16} color={colors.onAccent} />
        </View>
      </Pressable>

      <View style={styles.field}>
        <Text variant="label" color="textMuted">
          Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoComplete="name"
          maxLength={50}
          returnKeyType="done"
          accessibilityLabel="Name"
          style={styles.input}
        />
      </View>

      <Button
        label={submitLabel}
        disabled={trimmed === ''}
        onPress={() => onSubmit({ ...initial, name: trimmed, photoUri })}
        style={styles.submit}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { alignItems: 'center', gap: spacing.xl, alignSelf: 'stretch' },
    photo: { width: 120, height: 120 },
    badge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      borderWidth: 3,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    field: { alignSelf: 'stretch', gap: spacing.sm },
    input: {
      minHeight: 56,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      color: colors.text,
      fontFamily: 'PlusJakartaSans_500Medium',
      fontSize: 18,
    },
    submit: { alignSelf: 'stretch', borderRadius: radius.button },
  });
