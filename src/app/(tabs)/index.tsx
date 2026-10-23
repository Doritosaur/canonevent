import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { EntryCard } from '@/components/lore';
import {
  ActionSheet,
  Button,
  Chip,
  IconButton,
  Screen,
  SearchBar,
  Text,
  useToast,
} from '@/components/ui';
import { CATEGORIES, type Category, type Entry } from '@/data/types';
import { formatDate, formatMonth } from '@/lib/format';
import { useLore } from '@/state/lore';
import { spacing, useTheme } from '@/theme';

type Filter = 'All' | Category;
const FILTERS: readonly Filter[] = ['All', ...CATEGORIES];

type Section = { title: string; data: Entry[] };

/** Screen 2: Home timeline, grouped by month. */
export default function Home() {
  const { entries, deleteEntry, restoreEntry, syncEntries } = useLore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [menuFor, setMenuFor] = useState<Entry | null>(null);

  const filtering = query.trim() !== '' || filter !== 'All';

  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLowerCase();
    const visible = entries.filter(
      (e) =>
        (filter === 'All' || e.category === filter) &&
        (q === '' || `${e.title} ${e.summary} ${e.tags.join(' ')}`.toLowerCase().includes(q)),
    );
    const groups: Section[] = [];
    for (const entry of visible) {
      const title = formatMonth(entry.date);
      const last = groups.at(-1);
      if (last?.title === title) last.data.push(entry);
      else groups.push({ title, data: [entry] });
    }
    return groups;
  }, [entries, query, filter]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncEntries();
    } catch {
      toast.show({ message: 'Couldn’t refresh. Check your connection.' });
    } finally {
      setRefreshing(false);
    }
  }, [syncEntries, toast]);

  const remove = (entry: Entry) => {
    const removed = deleteEntry(entry.id);
    if (!removed) return;
    toast.show({ message: `Deleted “${removed.title}”`, actionLabel: 'Undo', onAction: () => restoreEntry(removed) });
  };

  return (
    <Screen hasTabBar style={styles.screen}>
      <View style={styles.header}>
        <Text variant="display" style={styles.title} accessibilityRole="header">
          Canon{' '}
          <Text variant="display" color="accent" style={styles.title}>
            Event
          </Text>
        </Text>
        <IconButton icon="settings" label="Settings" size={30} onPress={() => router.navigate('/profile')} />
      </View>

      <View style={styles.inset}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ItemSeparatorComponent={Separator}
        renderSectionHeader={({ section }) => (
          <Text variant="label" color="textMuted" style={styles.sectionHeader} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="heading" style={styles.emptyTitle}>
              {filtering ? 'No lore matches' : 'Nothing here yet'}
            </Text>
            <Text color="textMuted" style={styles.emptyBody}>
              {filtering
                ? 'Try a different search or category.'
                : 'Tap the mic and spill your first questionable decision.'}
            </Text>
            {!filtering && (
              <Button label="Spill your first lore" icon="mic" onPress={() => router.push('/record')} />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            title={item.title}
            date={formatDate(item.date)}
            summary={item.summary}
            outcome={item.outcome}
            icon={item.icon}
            tint={item.tint}
            onPress={() => router.push({ pathname: '/entry/[id]', params: { id: item.id } })}
            onLongPress={() => setMenuFor(item)}
          />
        )}
      />

      <ActionSheet
        visible={menuFor !== null}
        title={menuFor?.title}
        onClose={() => setMenuFor(null)}
        actions={
          menuFor
            ? [
                {
                  label: 'Open',
                  icon: 'chevron',
                  onPress: () => router.push({ pathname: '/entry/[id]', params: { id: menuFor.id } }),
                },
                { label: 'Delete', icon: 'trash', destructive: true, onPress: () => remove(menuFor) },
              ]
            : []
        }
      />
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: spacing.md,
  },
  title: { fontSize: 44, lineHeight: 50 },
  inset: { paddingHorizontal: 8 },
  chips: { gap: spacing.sm, paddingHorizontal: 8, paddingVertical: spacing.lg },
  list: { paddingBottom: spacing.lg, flexGrow: 1 },
  sectionHeader: { paddingHorizontal: 8, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  separator: { height: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { textAlign: 'center' },
  emptyBody: { textAlign: 'center' },
});
