import { File } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Deletes recordings from the device. Failures are ignored on purpose: a file that is already gone
 * (or, on web, a browser blob that expires on its own) should never block deleting the user's data.
 */
export function deleteAudioFiles(uris: (string | undefined)[]): void {
  for (const uri of uris) {
    if (!uri) continue;
    try {
      if (Platform.OS === 'web') {
        if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
        continue;
      }
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      // Already removed or not accessible.
    }
  }
}
