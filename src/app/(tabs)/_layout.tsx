import { Redirect, router, Tabs } from 'expo-router';

import { BottomNav, type NavItem } from '@/components/lore';
import { useLore } from '@/state/lore';

/** Route names double as nav keys. */
const NAV: [NavItem, NavItem, NavItem, NavItem] = [
  { key: 'index', label: 'Home', icon: 'home' },
  { key: 'insights', label: 'Insights', icon: 'insights' },
  { key: 'ask', label: 'Ask', icon: 'ask' },
  { key: 'profile', label: 'Profile', icon: 'profile' },
];

export default function TabsLayout() {
  const { hasOnboarded } = useLore();
  if (!hasOnboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab }) => (
        <BottomNav
          items={NAV}
          activeKey={state.routes[state.index].name}
          onSelect={(key) => {
            const route = state.routes.find((r) => r.name === key);
            if (route) navigateToTab(route.key);
          }}
          onRecord={() => router.push('/record')}
        />
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="ask" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
