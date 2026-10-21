import { router, usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Mascot, MicProblem, RecorderPanel } from '@/components/lore';
import { ArtBoard, ConfirmDialog, IconButton, Screen, Text } from '@/components/ui';
import { useRecorder } from '@/hooks/useRecorder';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { spacing, useTheme } from '@/theme';

const close = () => router.dismissTo('/(tabs)');

/** Screen 3: Voice recording. */
export default function Record() {
  const { colors } = useTheme();
  const rec = useRecorder();
  const problem = rec.status === 'denied' || rec.status === 'error';
  // Set once the user has chosen to leave, so the guard below lets the navigation through.
  const [leaving, setLeaving] = useState(false);
  const [blocked, setBlocked] = useState<(() => void) | null>(null);

  // Covers the X, the Android back button and the iOS swipe-back: all would silently drop the take.
  usePreventRemove(rec.status === 'recording' && !leaving, ({ repeat }) => setBlocked(() => repeat));

  const discard = async () => {
    const leave = blocked;
    setBlocked(null);
    setLeaving(true);
    const result = await rec.stop();
    deleteAudioFiles([result.uri]);
    leave?.();
  };

  const stop = async () => {
    setLeaving(true);
    const result = await rec.stop();
    router.replace({
      pathname: '/processing',
      params: { duration: String(result.seconds), uri: result.uri ?? '' },
    });
  };

  return (
    <Screen style={styles.screen}>
      <IconButton icon="close" label="Cancel recording" size={30} onPress={close} />

      {problem ? (
        <MicProblem
          kind={rec.status === 'denied' ? 'denied' : 'error'}
          canAskAgain={rec.canAskAgain}
          onRetry={rec.retry}
          onClose={close}
        />
      ) : (
        <>
          <ArtBoard designWidth={390} designHeight={250} style={styles.hero}>
            <Text variant="handLg" style={styles.title} accessibilityRole="header">
              Spill{'\n'}the{' '}
              <Text variant="handLg" color="accent">
                lore...
              </Text>
            </Text>
            <Text variant="note" color="accent" style={styles.note}>
              just{'\n'}ramble{'\n'}it&rsquo;s fine.
            </Text>
            <Svg width={22} height={40} viewBox="0 0 22 40" style={styles.curve}>
              <Path
                d="M16 2 C 20 12, 14 26, 5 36 M5 36 L6 26 M5 36 L14 34"
                stroke={colors.accent}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.mascot}>
              <Mascot pose="cat" width={104} />
            </View>
          </ArtBoard>

          <View style={styles.panel}>
            <RecorderPanel
              seconds={rec.seconds}
              level={rec.level}
              onStop={stop}
              caption="Just talk. No need to be clear."
            />
          </View>
        </>
      )}

      <ConfirmDialog
        visible={blocked !== null}
        title="Discard recording?"
        message="What you’ve recorded so far will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={discard}
        onCancel={() => setBlocked(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  hero: { marginTop: spacing.sm },
  title: { position: 'absolute', left: 46, top: 54, fontSize: 54, lineHeight: 58, transform: [{ rotate: '-12deg' }] },
  note: { position: 'absolute', left: 250, top: 4, fontSize: 25, lineHeight: 28, transform: [{ rotate: '-8deg' }] },
  curve: { position: 'absolute', left: 308, top: 98 },
  mascot: { position: 'absolute', left: 272, top: 138 },
  panel: { flex: 1, justifyContent: 'center', paddingBottom: spacing.lg },
});
