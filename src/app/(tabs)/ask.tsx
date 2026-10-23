import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MicProblem, QuestionRow, RecordButton, Waveform } from '@/components/lore';
import { ActionSheet, ArtBoard, Screen, Text, useToast } from '@/components/ui';
import { useRecorder } from '@/hooks/useRecorder';
import { deleteConversation, EmptyRecordingError, listConversations, type Conversation } from '@/lib/api';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { isEmptyTake } from '@/lib/recording';
import { transcribeQuestion } from '@/services/ai';
import { spacing } from '@/theme';

const MIN_HOLD_MS = 600;
const RECENT_COUNT = 8;

const askNew = (question: string) => router.push({ pathname: '/answer', params: { q: question } });
const openSaved = (id: string) => router.push({ pathname: '/answer', params: { c: id } });

/** Screen 11: Ask your past self. */
export default function Ask() {
  const toast = useToast();
  // Recording starts on press, not when the tab opens.
  const rec = useRecorder({ autoStart: false });
  const [listening, setListening] = useState(false);
  // A quick tap latches listening on, so people who can't hold (or use a screen reader) can tap to start and tap to finish.
  const [latched, setLatched] = useState(false);
  const [understanding, setUnderstanding] = useState(false);
  const [micDismissed, setMicDismissed] = useState(false);
  const [recent, setRecent] = useState<Conversation[] | null>(null);
  const [menuFor, setMenuFor] = useState<Conversation | null>(null);
  const pressedAt = useRef(0);

  const problem = !micDismissed && (rec.status === 'denied' || rec.status === 'error');

  // The list is the user's own history, so it reloads each time the tab is shown.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      listConversations(RECENT_COUNT)
        .then((list) => !cancelled && setRecent(list))
        .catch(() => !cancelled && setRecent((current) => current ?? []));
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const finish = async () => {
    setListening(false);
    setLatched(false);
    setUnderstanding(true);
    try {
      const take = await rec.stop();
      // Nothing audible: skip the transcription call entirely.
      if (!take.uri || isEmptyTake(take)) {
        deleteAudioFiles([take.uri]);
        toast.show({ message: 'I didn’t catch anything. Try again.' });
        return;
      }
      try {
        askNew(await transcribeQuestion(take.uri));
      } catch (error) {
        toast.show({
          message: error instanceof EmptyRecordingError ? 'I didn’t catch anything. Try again.' : 'Couldn’t make that out. Try again.',
        });
      } finally {
        // A spoken question is only used to get its text; the audio isn't kept.
        deleteAudioFiles([take.uri]);
      }
    } finally {
      setUnderstanding(false);
    }
  };

  const remove = (conversation: Conversation) => {
    setRecent((list) => list?.filter((c) => c.id !== conversation.id) ?? list);
    deleteConversation(conversation.id).catch(() => {
      toast.show({ message: 'Couldn’t delete that question. Try again.' });
      listConversations(RECENT_COUNT).then(setRecent).catch(() => {});
    });
  };

  const label = understanding ? 'Understanding your question…' : latched ? 'Listening… tap to finish' : 'Hold or tap, then ask';

  return (
    <Screen scroll hasTabBar style={styles.screen}>
      <ArtBoard designWidth={354} designHeight={200}>
        <Text variant="handLg" style={styles.title} accessibilityRole="header">
          ask your{'\n'}past{' '}
          <Text variant="handLg" color="accent">
            self...
          </Text>
        </Text>
      </ArtBoard>

      {problem ? (
        <MicProblem
          kind={rec.status === 'denied' ? 'denied' : 'error'}
          canAskAgain={rec.canAskAgain}
          onRetry={rec.retry}
          onClose={() => setMicDismissed(true)}
        />
      ) : (
        <View style={styles.center}>
          <RecordButton
            size={112}
            recording={listening}
            accessibilityLabel={latched ? 'Finish asking' : 'Ask by voice'}
            accessibilityHint={latched ? undefined : 'Double tap to start, then double tap again to finish'}
            onPressIn={() => {
              if (understanding) return;
              pressedAt.current = Date.now();
              // Already listening means this press is the second tap of a latched take.
              if (!listening) {
                setListening(true);
                void rec.retry();
              }
            }}
            onPressOut={() => {
              if (understanding || !listening) return;
              const held = Date.now() - pressedAt.current >= MIN_HOLD_MS;
              if (held || latched) void finish();
              else setLatched(true);
            }}
          />
          <Text variant="heading" accessibilityLiveRegion="polite" style={styles.holdLabel}>
            {label}
          </Text>
          {/* Reserved so the waveform appears here without covering the art above or pushing the list. */}
          <View style={styles.waveSlot}>{listening && <Waveform active height={56} />}</View>
        </View>
      )}

      <View style={styles.questions}>
        <Text variant="label" color="textMuted" accessibilityRole="header" style={styles.sectionHeader}>
          Recent questions
        </Text>
        {recent?.length === 0 && (
          <Text variant="body" color="textMuted" style={styles.empty}>
            The questions you ask will show up here.
          </Text>
        )}
        {recent?.map((q) => (
          <QuestionRow
            key={q.id}
            question={q.title ?? 'Untitled question'}
            onPress={() => openSaved(q.id)}
            onLongPress={() => setMenuFor(q)}
          />
        ))}
      </View>

      <ActionSheet
        visible={menuFor !== null}
        title={menuFor?.title ?? undefined}
        onClose={() => setMenuFor(null)}
        actions={
          menuFor
            ? [
                { label: 'Open', icon: 'chevron', onPress: () => openSaved(menuFor.id) },
                { label: 'Delete', icon: 'trash', destructive: true, onPress: () => remove(menuFor) },
              ]
            : []
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 18 },
  title: { position: 'absolute', left: 50, top: -4, fontSize: 52, lineHeight: 56, transform: [{ rotate: '-12deg' }] },
  center: { alignItems: 'center', gap: spacing.md, marginTop: -spacing.sm },
  waveSlot: { height: 64, alignSelf: 'stretch', justifyContent: 'center' },
  holdLabel: { fontSize: 18 },
  questions: { gap: 5, marginTop: spacing.sm },
  sectionHeader: { paddingHorizontal: 4, paddingBottom: spacing.xs },
  empty: { paddingHorizontal: 4 },
});
