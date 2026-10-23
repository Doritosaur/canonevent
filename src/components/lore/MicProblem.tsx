import { Linking, Platform, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme';

export type MicProblemProps = {
  /** `denied`: the user said no. `error`: the microphone could not start. */
  kind: 'denied' | 'error';
  /** False once the OS will no longer show the permission prompt; only Settings can fix it. */
  canAskAgain: boolean;
  onRetry: () => void;
  onClose: () => void;
};

/** Friendly recovery state shown in place of the recorder when the microphone is unavailable. */
export function MicProblem({ kind, canAskAgain, onRetry, onClose }: MicProblemProps) {
  const denied = kind === 'denied';
  const needsSettings = denied && !canAskAgain && Platform.OS !== 'web';

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text variant="hand" style={styles.title} accessibilityRole="header">
        {denied ? "can't hear you..." : 'mic trouble...'}
      </Text>
      <Text color="textMuted" style={styles.body}>
        {denied
          ? 'Canon Event needs the microphone to turn your voice into lore. Nothing is recorded until you tap record.'
          : 'Something stopped the microphone from starting. Check that no other app is using it, then try again.'}
      </Text>
      <View style={styles.actions}>
        {needsSettings ? (
          <Button label="Open settings" onPress={() => Linking.openSettings().catch(() => {})} />
        ) : (
          <Button label={denied ? 'Allow microphone' : 'Try again'} onPress={onRetry} />
        )}
        <Button label="Not now" variant="secondary" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  title: { fontSize: 40, lineHeight: 44, textAlign: 'center' },
  body: { textAlign: 'center', fontSize: 16, lineHeight: 24 },
  actions: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.md },
});
