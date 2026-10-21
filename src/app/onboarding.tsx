import { Redirect, router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Mascot, Sparkle } from '@/components/lore';
import { ArtBoard, Button, Screen, Text } from '@/components/ui';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

const SLIDES = [
  {
    key: 'welcome',
    title: ['Canon', 'Event'],
    subtitle: 'Your personal archive\nof questionable decisions.',
  },
  {
    key: 'speak',
    title: ['Just', 'speak.'],
    subtitle: 'Ramble out loud. We turn it into\na clear, searchable memory.',
  },
  {
    key: 'ask',
    title: ['Ask', 'yourself.'],
    subtitle: 'Spot your patterns, then ask what\npast you would say.',
  },
] as const;


/** Screen 1: Onboarding. A short, swipeable intro; every page can jump straight in. */
export default function Onboarding() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { hasOnboarded, completeOnboarding } = useLore();
  const { width, height } = useWindowDimensions();
  /** 1 on a normal phone, smaller on compact screens so the copy and button always fit. */
  const k = Math.min(1, width / 390, height / 780);
  const [index, setIndex] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);
  const list = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  if (hasOnboarded) return <Redirect href="/(tabs)" />;

  const start = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    list.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const onSettle =(e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <Screen style={styles.screen}>
      <FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSettle}
        onLayout={(e) => setPagerHeight(e.nativeEvent.layout.height)}
        style={styles.pager}
        renderItem={({ item, index: i }) => (
          <View style={{ width, height: pagerHeight }}>
            <View style={styles.art}>{i === 0 ? <WelcomeArt /> : <SecondaryArt slide={i} />}</View>
            <View style={styles.copy}>
              <Text
                variant="display"
                style={{ fontSize: Math.round(68 * k), lineHeight: Math.round(74 * k) }}
                accessibilityRole="header">
                {item.title[0]}{' '}
                <Text
                  variant="display"
                  color="accent"
                  style={{ fontSize: Math.round(68 * k), lineHeight: Math.round(74 * k) }}>
                  {item.title[1]}
                </Text>
              </Text>
              <Text
                variant="body"
                color="textSoft"
                style={[styles.subtitle, { fontSize: Math.round(22 * k), lineHeight: Math.round(34 * k) }]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button
          label="Get started"
          icon="arrow-right"
          onPress={start}
          style={[styles.button, { minHeight: Math.max(52, Math.round(66 * k)), marginTop: Math.round(spacing.xl * k) }]}
        />
        <Text variant="body" color="textMuted" style={styles.hint}>
          Just speak. We&rsquo;ll handle the rest.
        </Text>
        {/* Swiping is the only other way to change page, so expose it as an adjustable control. */}
        <View
          style={styles.dots}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Intro pages"
          accessibilityValue={{ text: `Page ${index + 1} of ${SLIDES.length}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => goTo(index + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** The mockup's first page: tagline, arrow, crawling mascot and doodles. */
function WelcomeArt() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <ArtBoard designWidth={390} designHeight={420} mode="fit" maxScale={1.1}>
      <Text variant="handLg" style={styles.tagline}>
        same{'\n'}mistakes{'\n'}new{'\n'}lore.
      </Text>

      <Svg width={44} height={40} viewBox="0 0 44 40" style={styles.arrow}>
        <Path
          d="M4 4 C 8 18, 22 28, 36 32 M36 32 L26 33 M36 32 L32 22"
          stroke={colors.sketch}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      <View style={styles.cross}>
        <Svg width={32} height={32} viewBox="0 0 32 32">
          <Path d="M3 3 L29 29 M29 3 L3 29" stroke={colors.sketchDim} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      </View>

      <View style={styles.mascot}>
        <Mascot pose="crawl" width={210} />
      </View>
      <View style={styles.sparkle}>
        <Sparkle size={16} twinkle />
      </View>
    </ArtBoard>
  );
}

function SecondaryArt({ slide }: { slide: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const speak = slide === 1;
  return (
    <ArtBoard designWidth={390} designHeight={420} mode="fit" maxScale={1.1}>
      <Text variant="handLg" color="accent" style={styles.aside}>
        {speak ? 'ramble\nit’s fine.' : 'what would\npast you say?'}
      </Text>
      <View style={styles.centerMascot}>
        <Mascot pose={speak ? 'laptop' : 'think'} width={speak ? 250 : 170} />
      </View>
      <View style={[styles.sparkle, { right: 70, bottom: 150 }]}>
        <Sparkle size={22} twinkle />
      </View>
    </ArtBoard>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  pager: { flex: 1 },
  art: { flex: 1, minHeight: 200 },
  copy: { alignItems: 'center', paddingHorizontal: 22, paddingTop: spacing.sm },
  subtitle: { textAlign: 'center', marginTop: spacing.xs },
  footer: { paddingHorizontal: 22, alignItems: 'center', paddingBottom: spacing.sm },
  button: { alignSelf: 'stretch', borderRadius: radius.button },
  hint: { fontSize: 16, marginTop: spacing.lg },
  dots: { flexDirection: 'row', gap: 15, marginTop: spacing.xl },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.dot },
  dotActive: { backgroundColor: colors.accent },

  tagline: { position: 'absolute', left: 34, top: 24, fontSize: 50, lineHeight: 50, transform: [{ rotate: '-10deg' }] },
  arrow: { position: 'absolute', left: 150, top: 208 },
  cross: { position: 'absolute', left: 28, top: 296 },
  mascot: { position: 'absolute', left: 90, top: 150 },
  sparkle: { position: 'absolute', left: 332, top: 300 },
  aside: { position: 'absolute', left: 40, top: 40, fontSize: 52, lineHeight: 54, transform: [{ rotate: '-8deg' }] },
  centerMascot: { position: 'absolute', left: 0, right: 0, top: 130, alignItems: 'center' },
});
