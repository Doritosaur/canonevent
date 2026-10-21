import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatClock } from '@/lib/format';
import { spacing } from '@/theme';
import { RecordButton } from './RecordButton';
import { Waveform } from './Waveform';

export type RecorderPanelProps = {
  seconds: number;
  /** Live input level 0–1 for the waveform. */
  level?: number;
  onStop: () => void;
  /** Muted line under the button, e.g. "Just talk. No need to be clear." */
  caption: string;
};

/** Live waveform, timer and stop button shared by the record and update screens. */
export function RecorderPanel({ seconds, level, onStop, caption }: RecorderPanelProps) {
  const { height } = useWindowDimensions();
  const compact = height < 700;
  return (
    <View style={styles.wrap}>
      <Waveform active level={level} height={compact ? 88 : 140} />
      <Text
        variant="title"
        accessibilityLabel={`Recording, ${formatClock(seconds)}`}
        accessibilityLiveRegion="polite"
        style={[styles.time, compact && styles.timeCompact]}>
        {formatClock(seconds)}
      </Text>
      <RecordButton recording onPress={onStop} size={compact ? 92 : 120} />
      <Text variant="heading" style={styles.stop}>
        Tap to stop
      </Text>
      <Text variant="body" color="textMuted" style={styles.caption}>
        {caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  time: { fontSize: 36, lineHeight: 42, fontFamily: 'PlusJakartaSans_400Regular', marginTop: spacing.md, marginBottom: spacing.lg },
  timeCompact: { fontSize: 30, lineHeight: 34, marginTop: spacing.sm, marginBottom: spacing.sm },
  stop: { fontSize: 18, marginTop: spacing.lg },
  caption: { fontSize: 16, marginTop: spacing.md },
});
