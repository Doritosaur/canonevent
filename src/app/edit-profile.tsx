import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { ProfileEditor } from '@/components/lore';
import { Screen, ScreenHeader } from '@/components/ui';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { goBack } from '@/lib/navigation';
import { useLore } from '@/state/lore';
import { spacing } from '@/theme';

/** Edit the name and photo chosen during onboarding. */
export default function EditProfile() {
  const { profile, setProfile } = useLore();
  const styles = useMemo(() => StyleSheet.create({ content: { gap: spacing.xl, paddingHorizontal: 22 } }), []);
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Screen scroll style={styles.content}>
      <ScreenHeader title="Edit profile" left={{ icon: 'back', label: 'Go back', onPress: () => goBack('/(tabs)/profile') }} />
      <ProfileEditor
        initial={profile}
        submitLabel="Save"
        onSubmit={(p) => {
          // Only delete photos we copied into the app; the Google one is a remote URL.
          if (profile.photoUri && profile.photoUri !== p.photoUri && profile.photoUri.startsWith('file:')) {
            deleteAudioFiles([profile.photoUri]);
          }
          setProfile(p);
          goBack('/(tabs)/profile');
        }}
      />
    </Screen>
  );
}
