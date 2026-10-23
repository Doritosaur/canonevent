import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { AudioBar, EntryTile, SummarySection } from '@/components/lore';
import {
  ActionSheet,
  Button,
  Card,
  Chip,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Text,
  useToast,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import { goBack } from '@/lib/navigation';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

const TABS = ['Summary', 'Transcript', 'AI Analysis'] as const;
type Tab = (typeof TABS)[number];

/** Screen 7: Entry detail. */
export default function EntryDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, deleteEntry, restoreEntry } = useLore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('Summary');
  const [menuOpen, setMenuOpen] = useState(false);
  const entry = getEntry(id);

  if (!entry) return <Redirect href="/(tabs)" />;

  const updateOutcome = () => router.push({ pathname: '/update', params: { id: entry.id } });

  const share = () => {
    Share.share({ message: `${entry.title} (${formatDate(entry.date)})\n\nLesson: ${entry.learned}` }).catch(() => {});
  };

  const remove = () => {
    const removed = deleteEntry(entry.id);
    router.dismissTo('/(tabs)');
    if (removed) {
      toast.show({ message: `Deleted “${removed.title}”`, actionLabel: 'Undo', onAction: () => restoreEntry(removed) });
    }
  };

  return (
    <Screen scroll style={styles.content}>
      <ScreenHeader
        left={{ icon: 'back', label: 'Back', onPress: () => goBack() }}
        right={{ icon: 'more', label: 'More actions', onPress: () => setMenuOpen(true) }}
      />

      <View style={styles.titleRow}>
        <EntryTile icon={entry.icon} tint={entry.tint} size={58} />
        <View style={styles.flex}>
          <Text variant="heading" accessibilityRole="header">
            {entry.title}
          </Text>
          <Text variant="body" color="textMuted">
            {formatDate(entry.date)} · {entry.category}
          </Text>
        </View>
      </View>

      <AudioBar durationSec={entry.durationSec} uri={entry.audioUri} memoryId={entry.id} audioStored={entry.audioStored} />

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {tab === 'Summary' && (
        <>
          <Card style={styles.summary}>
            <SummarySection title="What happened?" body={entry.happened} icon="dollar" tint="success" />
            <SummarySection title="What were you thinking?" body={entry.thinking} icon="chat" tint="purple" />
            <SummarySection title="What did you learn?" body={entry.learned} icon="bulb" tint="warning" />
          </Card>

          {entry.updates.length > 0 && (
            <View style={styles.timeline} accessibilityLabel="Outcome timeline">
              <Text variant="heading">How it played out</Text>
              <TimelineItem date={entry.date} label="Logged" text={entry.summary} />
              {entry.updates.map((u, i) => (
                <TimelineItem
                  key={`${u.date}-${i}`}
                  date={u.date}
                  label="Update"
                  text={u.text}
                  last={i === entry.updates.length - 1}
                />
              ))}
            </View>
          )}
        </>
      )}

      {tab === 'Transcript' && (
        <Card>
          <Text color="textMuted">{entry.transcript}</Text>
        </Card>
      )}

      {tab === 'AI Analysis' && (
        <Card>
          <Text color="textMuted">{entry.analysis}</Text>
        </Card>
      )}

      <View style={styles.tags}>
        {entry.tags.map((t, i) => (
          <Chip key={t} label={t} teal={i < 2} />
        ))}
      </View>

      <Button label="Update outcome" icon="mic" variant="secondary" onPress={updateOutcome} />

      <ActionSheet
        visible={menuOpen}
        title={entry.title}
        onClose={() => setMenuOpen(false)}
        actions={[
          { label: 'Update outcome', icon: 'mic', onPress: updateOutcome },
          { label: 'Share', icon: 'share', onPress: share },
          { label: 'Delete', icon: 'trash', destructive: true, onPress: remove },
        ]}
      />
    </Screen>
  );
}

function TimelineItem({ date, label, text, last = false }: { date: string; label: string; text: string; last?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.item}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {!last && <View style={styles.line} />}
      </View>
      <View style={styles.itemBody}>
        <Text variant="label" color="accent">
          {label} · {formatDate(date)}
        </Text>
        <Text variant="body" color="textMuted">
          {text}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  content: { gap: spacing.lg, paddingHorizontal: 18, paddingBottom: spacing.xxl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  summary: { gap: spacing.lg, borderRadius: radius.cardSm },
  timeline: { gap: spacing.md },
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 14, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 5 },
  line: { flex: 1, width: 2, marginTop: 4, backgroundColor: colors.border },
  itemBody: { flex: 1, gap: 2, paddingBottom: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
