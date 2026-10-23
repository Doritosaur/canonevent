import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { EntryTile, Sparkle } from '@/components/lore';
import { ArtBoard, Button, Card, Screen, Text } from '@/components/ui';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatDate } from '@/lib/format';
import { useLore } from '@/state/lore';
import { radius, spacing } from '@/theme';

/** Sparkles the traced artwork lost at its crop edge, positioned over the mascot art. */
const CONFETTI = [
  { x: 10, y: 52, size: 22 },
  { x: 22, y: 116, size: 16 },
  { x: 294, y: 6, size: 18 },
  { x: 322, y: 38, size: 24 },
];

/** First sentence of the lesson, used as the pull-quote. */
const firstSentence = (s: string) => (/^[^.!?]*[.!?]/.exec(s))?.[0] ?? s;

/** Screen 6: Saved. */
export default function Saved() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry } = useLore();
  const reduced = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(reduced ? 1 : 0));
  const entry = getEntry(id);

  useEffect(() => {
    if (reduced) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
  }, [reduced, pop]);

  if (!entry) return <Redirect href="/(tabs)" />;

  return (
    <Screen scroll style={styles.screen}>
      <ArtBoard designWidth={346} designHeight={330}>
        <Text variant="handLg" style={styles.title} accessibilityRole="header">
          Added to{'\n'}your{' '}
          <Text variant="handLg" color="accent">
            lore!
          </Text>
        </Text>
        <Animated.View
          style={[
            styles.mascot,
            {
              opacity: pop,
              transform: [
                { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
                { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              ],
            },
          ]}>
          {CONFETTI.map((c, i) => (
            <View key={`${c.x}-${c.y}`} style={[styles.confetti, { left: c.x, top: c.y }]}>
              <Sparkle size={c.size} twinkle delay={i * 260} />
            </View>
          ))}
        </Animated.View>
      </ArtBoard>

      <Card style={styles.card}>
        <View style={styles.row}>
          <EntryTile icon={entry.icon} tint={entry.tint} size={64} />
          <View style={styles.text}>
            <Text variant="heading" numberOfLines={1} style={styles.entryTitle}>
              {entry.title}
            </Text>
            <Text variant="body" color="textMuted">
              {formatDate(entry.date)}
            </Text>
            <Text variant="body" color="textSoft" style={styles.quote}>
              “{firstSentence(entry.learned)}”
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="View entry"
          variant="secondary"
          style={styles.button}
          onPress={() => router.replace({ pathname: '/entry/[id]', params: { id: entry.id } })}
        />
        <Button label="Done" style={styles.button} onPress={() => router.dismissTo('/(tabs)')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 22, paddingBottom: spacing.xl },
  title: {
    position: 'absolute',
    left: 56,
    top: 14,
    fontSize: 52,
    lineHeight: 56,
    transform: [{ rotate: '-10deg' }],
    zIndex: 1,
  },
  mascot: { position: 'absolute', left: -2, top: 170 },
  confetti: { position: 'absolute' },
  card: { borderRadius: radius.card, padding: spacing.lg + 2 },
  row: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  text: { flex: 1, gap: 3 },
  entryTitle: { fontSize: 17 },
  quote: { fontSize: 18, lineHeight: 27, marginTop: spacing.sm },
  actions: { gap: spacing.md, marginTop: spacing.xl },
  button: { minHeight: 64, borderRadius: radius.button },
});
