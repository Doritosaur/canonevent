import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Glow, Screen, SegmentedControl, SettingsRow, Text, useToast } from '@/components/ui';
import { initials, USER } from '@/data/profile';
import { deleteAudioFiles } from '@/lib/audioFiles';
import { confirm } from '@/lib/confirm';
import { useLore } from '@/state/lore';
import { type Palette, radius, spacing, type ThemePreference, useTheme } from '@/theme';

const THEME_LABELS = ['System', 'Light', 'Dark'] as const;
type ThemeLabel = (typeof THEME_LABELS)[number];

const toPreference = (label: ThemeLabel): ThemePreference => label.toLowerCase() as ThemePreference;
const toLabel = (p: ThemePreference): ThemeLabel => (p.charAt(0).toUpperCase() + p.slice(1)) as ThemeLabel;

/** Profile tab: who you are, appearance, your data, and signing out. */
export default function Profile() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { entries, logout, deleteAllData } = useLore();
  const toast = useToast();

  const lessons = entries.filter((e) => e.learned.trim() !== '').length;
  const updates = entries.reduce((n, e) => n + e.updates.length, 0);

  const onDelete = async () => {
    const ok = await confirm(
      'Delete all data?',
      'This permanently removes every entry and recording from this device. It can’t be undone.',
      'Delete everything',
    );
    if (!ok) return;
    deleteAudioFiles(entries.map((e) => e.audioUri));
    deleteAllData();
    toast.show({ message: 'All your data was deleted' });
  };

  const onLogout = async () => {
    const ok = await confirm('Log out?', 'Your lore stays on this device. You’ll go back to the welcome screen.', 'Log out');
    if (!ok) return;
    logout();
    router.replace('/onboarding');
  };

  return (
    <Screen scroll hasTabBar style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatarWrap}>
          <Glow size={190} opacity={0.35} style={styles.avatarGlow} />
          <View style={styles.avatar} accessibilityLabel={`${USER.name}'s avatar`}>
            <Text variant="title" color="onAccent" style={styles.initials}>
              {initials(USER.name)}
            </Text>
          </View>
        </View>
        <Text variant="title" accessibilityRole="header">
          {USER.name}
        </Text>
      </View>

      <Card style={styles.stats}>
        <Stat label="Decisions" value={entries.length} />
        <View style={styles.divider} />
        <Stat label="Lessons" value={lessons} />
        <View style={styles.divider} />
        <Stat label="Updates" value={updates} />
      </Card>

      <SectionLabel>Appearance</SectionLabel>
      <Card style={styles.group}>
        <View style={styles.themeBlock}>
          <Text variant="bodyStrong">Theme</Text>
          <Text variant="caption" color="textMuted">
            System follows your phone&rsquo;s light or dark setting.
          </Text>
          <View style={styles.segment}>
            <SegmentedControl
              options={THEME_LABELS}
              value={toLabel(preference)}
              onChange={(label) => setPreference(toPreference(label))}
            />
          </View>
        </View>
      </Card>

      <SectionLabel>Your data</SectionLabel>
      <Card style={styles.group}>
        <SettingsRow
          icon="trash"
          label="Delete all data"
          hint="Removes every entry and recording from this device"
          destructive
          onPress={onDelete}
        />
      </Card>

      <SectionLabel>Account</SectionLabel>
      <Card style={styles.group}>
        <SettingsRow icon="logout" label="Log out" hint="Return to the welcome screen" chevron onPress={onLogout} />
      </Card>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      variant="label"
      color="textMuted"
      accessibilityRole="header"
      style={{ marginTop: spacing.lg, marginBottom: -spacing.xs, letterSpacing: 0.6, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const styles = useMemo(() => makeStatStyles(), []);
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text variant="title" color="accent">
        {value}
      </Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const makeStatStyles = () => StyleSheet.create({ stat: { flex: 1, alignItems: 'center', gap: spacing.xs } });

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    content: { gap: spacing.md, paddingHorizontal: 18, paddingBottom: spacing.xxl },
    hero: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.sm },
    avatarWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    avatarGlow: { left: -47, top: -47 },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: { fontSize: 34, lineHeight: 40, letterSpacing: 1 },
    stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderRadius: radius.card },
    divider: { width: 1, height: 36, backgroundColor: colors.border },
    group: { padding: 0, borderRadius: radius.card, overflow: 'hidden' },
    themeBlock: { padding: spacing.lg, gap: spacing.xs },
    segment: { marginTop: spacing.md },
  });
