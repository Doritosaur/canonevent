import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Mascot, MicProblem, RecorderPanel } from '@/components/lore';
import { ArtBoard, Icon, IconButton, Screen, Text } from '@/components/ui';
import { useRecorder } from '@/hooks/useRecorder';
import { formatElapsed } from '@/lib/format';
import { useLore } from '@/state/lore';
import { spacing, useTheme } from '@/theme';

/** Screen 8: Update outcome. */
export default function UpdateOutcome() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry } = useLore();
  const rec = useRecorder();
  const entry = getEntry(id);

  if (!entry) return <Redirect href="/(tabs)" />;

  const problem = rec.status === 'denied' || rec.status === 'error';
  const stop = async () => {
    const result = await rec.stop();
    router.replace({ pathname: '/updated', params: { id: entry.id, duration: String(result.seconds) } });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <IconButton icon="close" label="Cancel" size={30} onPress={() => router.back()} />
        <Text variant="heading" accessibilityRole="header" style={styles.headerTitle}>
          Update outcome
        </Text>
        <View style={styles.headerSide} />
      </View>

      {problem ? (
        <MicProblem
          kind={rec.status === 'denied' ? 'denied' : 'error'}
          canAskAgain={rec.canAskAgain}
          onRetry={rec.retry}
          onClose={() => router.back()}
        />
      ) : (
        <>
          <View style={styles.elapsed}>
            <Icon name="calendar" size={22} color={colors.textMuted} />
            <Text variant="body" color="textMuted" style={styles.elapsedText}>
              {formatElapsed(entry.date)}
            </Text>
          </View>

          <ArtBoard designWidth={390} designHeight={230}>
            <Text variant="handLg" style={styles.title} accessibilityRole="header">
              So... how{'\n'}did that{' '}
              <Text variant="handLg" color="accent">
                go?
              </Text>
            </Text>
            <View style={styles.mascot}>
              <Mascot pose="lean" width={124} />
            </View>
          </ArtBoard>

          <View style={styles.panel}>
            <RecorderPanel
              seconds={rec.seconds}
              level={rec.level}
              caption="Speak your update or reaction."
              onStop={stop}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSide: { width: 40 },
  elapsed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginTop: spacing.md },
  elapsedText: { fontSize: 18 },
  title: { position: 'absolute', left: 58, top: 24, fontSize: 48, lineHeight: 52, transform: [{ rotate: '-8deg' }] },
  mascot: { position: 'absolute', left: 24, top: 144 },
  panel: { flex: 1, justifyContent: 'center', paddingBottom: spacing.lg },
});
