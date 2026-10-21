import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { InsightCard, type InsightCardProps } from '@/components/lore';
import { Card, Screen, SegmentedControl, Text } from '@/components/ui';
import { CATEGORIES, categoryMeta } from '@/data/types';
import { monthsSpan } from '@/lib/format';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

const TABS = ['Highlights', 'Categories', 'Trends'] as const;
type Tab = (typeof TABS)[number];

/** Static until a real pattern-detection backend exists. */
const HIGHLIGHTS: InsightCardProps[] = [
  {
    text: 'You tend to buy tools before validating if you actually need them.',
    meta: '7 similar decisions',
    tone: 'danger',
    icon: 'cart',
  },
  {
    text: 'You underestimate how much time side projects require.',
    meta: '5 similar decisions',
    tone: 'purple',
    icon: 'clock',
  },
  {
    text: 'You often abandon projects when the initial excitement disappears.',
    meta: '6 similar decisions',
    tone: 'info',
    icon: 'trend',
  },
  {
    text: 'You make better decisions when you set a budget beforehand.',
    meta: '4 similar decisions',
    tone: 'success',
    icon: 'people',
  },
];

const MONTHS_SHOWN = 6;

/** Screen 10: Insights. */
export default function Insights() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { entries } = useLore();
  const [tab, setTab] = useState<Tab>('Highlights');

  const byCategory = useMemo(
    () => CATEGORIES.map((c) => ({ category: c, count: entries.filter((e) => e.category === c).length })),
    [entries],
  );

  const byMonth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1 - i), 1));
      const key = d.toISOString().slice(0, 7);
      return {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
        count: entries.filter((e) => e.date.startsWith(key)).length,
      };
    });
  }, [entries]);

  const months = monthsSpan(entries.map((e) => e.date));

  return (
    <Screen scroll hasTabBar style={styles.content}>
      <Text variant="title" accessibilityRole="header">
        Your patterns
      </Text>
      <Text variant="caption" color="textMuted">
        Based on {entries.length} {entries.length === 1 ? 'decision' : 'decisions'} over {months}{' '}
        {months === 1 ? 'month' : 'months'}.
      </Text>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {tab === 'Highlights' && HIGHLIGHTS.map((h) => <InsightCard key={h.text} {...h} />)}

      {tab === 'Categories' && (
        <Card style={styles.bars}>
          {byCategory.map(({ category, count }) => (
            <BarRow
              key={category}
              label={category}
              count={count}
              max={Math.max(...byCategory.map((c) => c.count), 1)}
              color={colors[categoryMeta[category].tint]}
            />
          ))}
        </Card>
      )}

      {tab === 'Trends' && (
        <Card style={styles.bars}>
          <Text variant="label">Decisions logged per month</Text>
          {byMonth.map((m) => (
            <BarRow
              key={m.key}
              label={m.label}
              count={m.count}
              max={Math.max(...byMonth.map((x) => x.count), 1)}
              color={colors.accent}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.barRow} accessible accessibilityLabel={`${label}: ${count}`}>
      <Text variant="caption" color="textMuted" style={styles.barLabel}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(count / max) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text variant="label" style={styles.barCount}>
        {count}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: spacing.xxl },
  bars: { gap: spacing.md },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  barLabel: { width: 110 },
  track: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  barCount: { width: 20, textAlign: 'right' },
});
