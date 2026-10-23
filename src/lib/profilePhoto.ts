import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/** Lets the user crop a square photo and returns a URI that survives app restarts, or null if cancelled. */
export async function pickProfilePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled) return null;
  const uri = result.assets[0].uri;
  if (Platform.OS === 'web') return uri;
  // Picker results live in the cache directory, which the OS may clear.
  const dest = new File(Paths.document, `profile-${Date.now()}.jpg`);
  await new File(uri).copy(dest);
  return dest.uri;
}
