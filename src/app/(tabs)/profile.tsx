import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, ConfirmDialog, Glow, Screen, SegmentedControl, SettingsRow, Text, useToast } from '@/components/ui';
import { signOutOfGoogle } from '@/lib/googleAuth';
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
  const { entries, profile, logout, deleteAllData, flushOutbox } = useLore();
  const name = profile?.name ?? '';
  const toast = useToast();

  const lessons = entries.filter((e) => e.learned.trim() !== '').length;
  const updates = entries.reduce((n, e) => n + e.updates.length, 0);

  const [dialog, setDialog] = useState<'delete' | 'logout' | null>(null);
  const closeDialog = () => setDialog(null);

  const onDelete = () => {
    closeDialog();
    deleteAllData().then(
      () => toast.show({ message: 'All your data was deleted' }),
      () => toast.show({ message: 'Couldn’t delete your data. Check your connection and try again.' }),
    );
  };

  const onLogout = () => {
    closeDialog();
    // Best effort: upload anything still waiting so signing out doesn't drop it.
    void flushOutbox()
      .catch(() => {})
      .finally(() => {
        signOutOfGoogle();
        logout();
        router.replace('/onboarding');
      });
  };

  return (
    <Screen scroll hasTabBar style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatarWrap}>
          <Glow size={190} opacity={0.35} style={styles.avatarGlow} />
          <Avatar name={name} uri={profile?.photoUri} size={96} />
        </View>
        <Text variant="title" accessibilityRole="header">
          {name}
        </Text>
        <Text variant="caption" color="textMuted">
          {profile?.email}
        </Text>
        <Button
          label="Edit profile"
          variant="secondary"
          icon="edit"
          onPress={() => router.push('/edit-profile')}
          style={styles.editButton}
        />
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
          hint="Removes every entry, recording and question from your account"
          destructive
          onPress={() => setDialog('delete')}
        />
      </Card>

      <SectionLabel>Account</SectionLabel>
      <Card style={styles.group}>
        <SettingsRow icon="logout" label="Log out" hint="Return to the welcome screen" chevron onPress={() => setDialog('logout')} />
      </Card>

      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Delete all data?"
        message="This permanently removes every entry, recording and question from your account and this device. It can’t be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={onDelete}
        onCancel={closeDialog}
      />
      <ConfirmDialog
        visible={dialog === 'logout'}
        title="Log out?"
        message="Your lore stays safe in your account. You’ll go back to the welcome screen."
        confirmLabel="Log out"
        onConfirm={onLogout}
        onCancel={closeDialog}
      />
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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStatStyles(), []);
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      {/* The exact brand cyan in both themes. Text's `accent` colour darkens to a teal on light backgrounds. */}
      <Text variant="title" style={{ color: colors.accent }}>
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
    editButton: { minHeight: 44, marginTop: spacing.md },
    stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderRadius: radius.card },
    divider: { width: 1, height: 36, backgroundColor: colors.border },
    group: { padding: 0, borderRadius: radius.card, overflow: 'hidden' },
    themeBlock: { padding: spacing.lg, gap: spacing.xs },
    segment: { marginTop: spacing.md },
  });
