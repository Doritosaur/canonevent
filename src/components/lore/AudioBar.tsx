import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { formatClock } from '@/lib/format';
import { type Palette, radius, spacing, useTheme } from '@/theme';

export type AudioBarProps = {
  durationSec: number;
  /** Local recording to play. Without one, playback is simulated (sample entries have no audio). */
  uri?: string;
};

const BARS = 36;
const heights = Array.from({ length: BARS }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

export function AudioBar({ durationSec, uri }: AudioBarProps) {
  return uri ? <RealAudioBar uri={uri} durationSec={durationSec} /> : <SimulatedAudioBar durationSec={durationSec} />;
}

function RealAudioBar({ uri, durationSec }: { uri: string; durationSec: number }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const total = status.duration > 0 ? status.duration : durationSec;

  const toggle = async () => {
    try {
      if (status.playing) {
        player.pause();
        return;
      }
      if (status.didJustFinish || status.currentTime >= total - 0.2) await player.seekTo(0);
      player.play();
    } catch {
      // A recording that can no longer be loaded (e.g. a web blob from a previous session) just stays silent.
    }
  };

  return <AudioBarView playing={status.playing} position={status.currentTime} total={total} onToggle={toggle} />;
}

function SimulatedAudioBar({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= durationSec) {
          setPlaying(false);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, durationSec]);

  return (
    <AudioBarView playing={playing} position={position} total={durationSec} onToggle={() => setPlaying((p) => !p)} />
  );
}

type ViewProps = { playing: boolean; position: number; total: number; onToggle: () => void };

function AudioBarView({ playing, position, total, onToggle }: ViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const progress = total > 0 ? position / total : 0;
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Pause recording' : 'Play recording'}
        onPress={onToggle}
        style={styles.play}>
        <Icon name={playing ? 'pause' : 'play'} size={16} color={colors.onAccent} filled />
      </Pressable>
      <Text variant="caption" color="textMuted">
        {formatClock(position)}
      </Text>
      <View style={styles.bars}>
        {heights.map((h, i) => (
          <View
            key={i}
            style={[styles.bar, { height: 22 * h }, i / BARS < progress && { backgroundColor: colors.accent }]}
          />
        ))}
      </View>
      <Text variant="caption" color="textMuted">
        {formatClock(total)}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.cardSm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  play: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 24 },
  bar: { width: 2, borderRadius: 1, backgroundColor: colors.textFaint },
});
