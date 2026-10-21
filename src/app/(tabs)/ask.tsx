import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Mascot, QuestionRow, RecordButton, Waveform } from '@/components/lore';
import { ArtBoard, IconButton, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme';

const SUGGESTIONS = [
  'Should I buy this new laptop?',
  'Is this job switch a good idea?',
  'Have I made similar decisions before?',
  'What do you think about this plan?',
];

const MIN_HOLD_MS = 600;

const ask = (q: string) => router.push({ pathname: '/answer', params: { q } });

/** Screen 11: Ask your past self. */
export default function Ask() {
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState(false);
  const pressedAt = useRef(0);

  return (
    <Screen scroll hasTabBar style={styles.screen}>
      <View style={styles.close}>
        <IconButton icon="close" label="Close" size={30} onPress={() => router.navigate('/(tabs)')} />
      </View>

      <ArtBoard designWidth={354} designHeight={200}>
        <Text variant="handLg" style={styles.title} accessibilityRole="header">
          ask your{'\n'}past{' '}
          <Text variant="handLg" color="accent">
            self...
          </Text>
        </Text>
        <View style={styles.mascot}>
          <Mascot pose="think" width={78} />
        </View>
      </ArtBoard>

      <View style={styles.center}>
        <RecordButton
          size={112}
          onPressIn={() => {
            pressedAt.current = Date.now();
            setHint(false);
            setListening(true);
          }}
          onPressOut={() => {
            setListening(false);
            // Voice capture is mocked: a long-enough hold asks the first suggestion.
            if (Date.now() - pressedAt.current >= MIN_HOLD_MS) ask(SUGGESTIONS[0]);
            else setHint(true);
          }}
        />
        <Text variant="heading" color={hint ? 'accent' : 'text'} style={styles.holdLabel}>
          {hint ? 'Keep holding while you talk' : 'Hold and ask'}
        </Text>
        {/* Reserved so the waveform appears here without covering the art above or pushing the list. */}
        <View style={styles.waveSlot}>{listening && <Waveform active height={56} />}</View>
      </View>

      <View style={styles.questions}>
        {SUGGESTIONS.map((q) => (
          <QuestionRow key={q} question={q} onPress={() => ask(q)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 18 },
  close: { marginLeft: -4 },
  title: { position: 'absolute', left: 50, top: -4, fontSize: 52, lineHeight: 56, transform: [{ rotate: '-12deg' }] },
  mascot: { position: 'absolute', left: 250, top: 66 },
  center: { alignItems: 'center', gap: spacing.md, marginTop: -spacing.sm },
  waveSlot: { height: 64, alignSelf: 'stretch', justifyContent: 'center' },
  holdLabel: { fontSize: 18 },
  questions: { gap: 5, marginTop: spacing.sm },
});
