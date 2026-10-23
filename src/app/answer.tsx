import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EntryCard, RelatedRow } from '@/components/lore';
import { Button, Card, IconButton, Screen, SegmentedControl, Text } from '@/components/ui';
import type { PastSelfAnswer } from '@/data/types';
import { newMemoryId } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { goBack } from '@/lib/navigation';
import { askPastSelf, openPastAnswer } from '@/services/ai';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

const TABS = ['Answer', 'Relevant memories', 'Transcript'] as const;
type Tab = (typeof TABS)[number];

/** Screen 12: AI response. */
export default function Answer() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // `q` is a new question; `c` reopens one that was asked before, exactly as it was answered.
  const { q, c } = useLocalSearchParams<{ q?: string; c?: string }>();
  const [tab, setTab] = useState<Tab>('Answer');
  const [result, setResult] = useState<PastSelfAnswer | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // The id a new question is saved under. Retrying reuses it, so the answer is never asked for twice.
  const [conversationId] = useState(newMemoryId);

  useEffect(() => {
    let cancelled = false;
    const entries = useLore.getState().entries;
    const load = c ? openPastAnswer(c, entries) : askPastSelf(q ?? '', conversationId, entries);
    load
      .then((r) => !cancelled && setResult(r))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [q, c, conversationId, attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  if (!q && !c) return <Redirect href="/(tabs)/ask" />;

  const open = (id: string) => router.push({ pathname: '/entry/[id]', params: { id } });
  const askAgain = () => router.dismissTo('/(tabs)/ask');

  return (
    <Screen scroll style={styles.content}>
      <View style={styles.back}>
        <IconButton icon="close" label="Close" size={30} onPress={() => goBack('/(tabs)/ask')} />
      </View>
      <Text variant="heading" accessibilityRole="header" style={styles.title}>
        Here&rsquo;s what your past self says…
      </Text>

      <Text variant="caption" color="textMuted">
        You asked: {result?.question ?? q}
      </Text>
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {failed ? (
        <Card style={styles.answer} accessibilityLiveRegion="polite">
          <Text variant="heading">I couldn&rsquo;t get an answer</Text>
          <Text color="textMuted" style={styles.failedBody}>
            Your lore couldn&rsquo;t be reached just now. Nothing was lost; try again in a moment.
          </Text>
          <Button label="Try again" onPress={retry} />
        </Card>
      ) : !result ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : (
        <>
          {tab === 'Answer' && (
            <>
              <Card style={styles.answer}>
                <Text style={styles.answerText} color="textSoft">
                  {result.answer}
                </Text>

                <Text variant="heading" style={styles.consider}>
                  Before deciding, consider:
                </Text>
                <View style={styles.bullets}>
                  {result.considerations.map((c) => (
                    <View key={c} style={styles.bullet}>
                      <View style={styles.dot} />
                      <Text variant="body" color="textSoft" style={styles.flex}>
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>

              <Text variant="heading" style={styles.related}>
                Related from your lore
              </Text>
              {result.related.map(({ entry, reason }) => (
                <RelatedRow key={entry.id} entry={entry} reason={reason} onPress={() => open(entry.id)} />
              ))}
            </>
          )}

          {tab === 'Relevant memories' &&
            result.related.map(({ entry }) => (
              <EntryCard
                key={entry.id}
                title={entry.title}
                date={formatDate(entry.date)}
                summary={entry.summary}
                outcome={entry.outcome}
                icon={entry.icon}
                tint={entry.tint}
                onPress={() => open(entry.id)}
              />
            ))}

          {tab === 'Transcript' && (
            <Card style={styles.transcript}>
              <Text variant="label" color="accent">
                You asked
              </Text>
              <Text color="textSoft">{result.question}</Text>
              <Text variant="label" color="accent">
                Past you answered
              </Text>
              <Text color="textSoft">{result.answer}</Text>
            </Card>
          )}
        </>
      )}

      <Button label="Ask another question" icon="mic" variant="light" onPress={askAgain} style={styles.cta} />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  content: { gap: spacing.md, paddingHorizontal: 18, paddingBottom: spacing.xxl },
  back: { marginLeft: -4 },
  title: { fontSize: 20, marginTop: spacing.xs },
  flex: { flex: 1 },
  loading: { marginVertical: spacing.xxl },
  answer: { borderRadius: radius.card, padding: spacing.lg + 2 },
  answerText: { fontSize: 19, lineHeight: 28 },
  consider: { marginTop: spacing.xl, fontSize: 18 },
  bullets: { gap: spacing.sm, marginTop: spacing.md },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.text },
  related: { marginTop: spacing.sm, fontSize: 20 },
  failedBody: { marginVertical: spacing.md },
  transcript: { gap: spacing.sm },
  cta: { marginTop: spacing.sm, minHeight: 62, borderRadius: radius.button },
});
