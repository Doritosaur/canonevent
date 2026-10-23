import { Image, type ImageSource } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ProfileEditor, Sparkle } from '@/components/lore';
import { Button, Screen, Text } from '@/components/ui';
import { signInWithGoogle } from '@/lib/googleAuth';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, useTheme } from '@/theme';

const ART: Record<'welcome' | 'speak' | 'ask', ImageSource> = {
  welcome: require('../../assets/illustrations/image-1.png') as ImageSource,
  speak: require('../../assets/illustrations/image-2.png') as ImageSource,
  ask: require('../../assets/illustrations/image-3.png') as ImageSource,
};

const ASIDE: Record<'welcome' | 'speak' | 'ask', string> = {
  welcome: 'same\nmistakes\nnew\nlore.',
  speak: 'ramble\nit’s fine.',
  ask: 'what would\npast you say?',
};

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
/** Upper bound for the size factor, so tablets get bigger type and art without it ballooning. */
const MAX_SCALE = 1.6;
/** Widest the content column grows; on tablets it centres instead of stretching edge to edge. */
const MAX_CONTENT_WIDTH = 560;

/** Screen 1: Onboarding. A short, swipeable intro with Google sign-in, then name and photo setup. */
export default function Onboarding() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { hasOnboarded, profile, setProfile, completeOnboarding } = useLore();
  const { width, height } = useWindowDimensions();
  /** 1 on a normal phone, smaller on compact screens, and larger (capped) on tablets. */
  const k = Math.min(MAX_SCALE, width / 390, height / 780);
  /** Tablets get a vertically centred block instead of art floating in a tall empty pager. */
  const isLarge = width >= 600;
  const largePagerHeight = Math.round(500 * k);
  const [index, setIndex] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);
  /** Measured pager width; the window can be wider than the area the screen is rendered in (e.g. on web). */
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const pageWidth = measuredWidth || width;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  if (hasOnboarded) return <Redirect href="/(tabs)" />;

  const signIn = async () => {
    setLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.status === 'ok') setProfile(result.profile);
    else if (result.status === 'error') setError(result.message);
  };

  // Signed in but not finished: survives the app being closed mid-setup.
  if (profile) {
    return (
      <Screen scroll style={styles.setup}>
        <View style={styles.setupHeader}>
          <Text variant="display" style={styles.setupTitle} accessibilityRole="header">
            Set up your{' '}
            <Text variant="display" color="accent" style={styles.setupTitle}>
              profile
            </Text>
          </Text>
          <Text variant="body" color="textSoft" style={styles.setupSubtitle}>
            Add a photo and tell us what to call you. You can change these any time.
          </Text>
        </View>
        <ProfileEditor
          initial={profile}
          submitLabel="Continue"
          onSubmit={(p) => {
            setProfile(p);
            completeOnboarding();
            router.replace('/(tabs)');
          }}
        />
      </Screen>
    );
  }

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    list.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  // Track the page live while dragging; momentum-end alone doesn't fire on every drag release.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.min(SLIDES.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.x / pageWidth)));
    setIndex((prev) => (prev === next ? prev : next));
  };

  return (
    <Screen style={[styles.screen, isLarge && styles.screenLarge]}>
      <FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => {
          setPagerHeight(e.nativeEvent.layout.height);
          setMeasuredWidth(e.nativeEvent.layout.width);
        }}
        getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
        style={[styles.pager, isLarge && { flexGrow: 0, flexShrink: 0, flexBasis: largePagerHeight, height: largePagerHeight }]}
        renderItem={({ item }) => (
          <View style={{ width: pageWidth, height: isLarge ? largePagerHeight : pagerHeight }}>
            <View style={styles.art}><SlideArt slide={item.key} /></View>
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
          label="Continue with Google"
          icon="arrow-right"
          loading={loading}
          onPress={signIn}
          style={[styles.button, { minHeight: Math.max(52, Math.round(66 * k)), marginTop: Math.round(spacing.xl * k) }]}
        />
        {error && (
          <Text variant="caption" color="danger" style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
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
            <Pressable key={s.key} hitSlop={10} onPress={() => goTo(i)} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** One illustration per slide, with a twinkling sparkle. */
function SlideArt({ slide }: { slide: (typeof SLIDES)[number]['key'] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { width, height } = useWindowDimensions();
  /** Same factor as the screen copy, so art and text scale together. */
  const k = Math.min(MAX_SCALE, width / 390, height / 780);
  return (
    <View style={styles.artWrap}>
      <Image
        source={ART[slide]}
        style={[styles.artImage, { maxWidth: Math.round(230 * k), maxHeight: Math.round(200 * k), marginTop: Math.round(30 * k) }]}
        contentFit="contain"
        accessible={false}
      />
      <Text
        variant="handLg"
        color={slide === 'welcome' ? undefined : 'accent'}
        style={[
          styles.aside,
          { top: Math.round(36 * k), left: Math.round(28 * k), fontSize: Math.round(40 * k), lineHeight: Math.round(42 * k) },
        ]}
        pointerEvents="none">
        {ASIDE[slide]}
      </Text>
      <View style={styles.sparkle}>
        <Sparkle size={20} twinkle />
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  screenLarge: { justifyContent: 'center' },
  pager: { flex: 1 },
  art: { flex: 1, minHeight: 0, overflow: 'hidden' },
  copy: { alignItems: 'center', paddingHorizontal: 22, paddingTop: spacing.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  subtitle: { textAlign: 'center', marginTop: spacing.xs },
  footer: { paddingHorizontal: 22, alignItems: 'center', paddingBottom: spacing.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  button: { alignSelf: 'stretch', borderRadius: radius.button },
  error: { textAlign: 'center', marginTop: spacing.md },
  setup: { paddingHorizontal: 22, gap: spacing.xl, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  setupHeader: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  setupTitle: { fontSize: 48, lineHeight: 54, textAlign: 'center' },
  setupSubtitle: { textAlign: 'center', fontSize: 18, lineHeight: 26 },
  hint: { fontSize: 16, marginTop: spacing.lg },
  dots: { flexDirection: 'row', gap: 15, marginTop: spacing.xl },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.dot },
  dotActive: { backgroundColor: colors.accent },
  artWrap: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  artImage: { flex: 1, minHeight: 0, width: '100%', maxWidth: 280, maxHeight: 240, alignSelf: 'center' },
  sparkle: { position: 'absolute', right: 44, bottom: 24 },
  aside: { position: 'absolute', left: 28, top: 36, fontSize: 40, lineHeight: 42, transform: [{ rotate: '-8deg' }] },
});
