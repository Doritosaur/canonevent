// Per-weight imports: the package root bundles every weight and italic (about 1.4 MB of unused TTFs).
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand/400Regular';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui';
import { useWebSelectionStyle } from '@/hooks/useWebSelectionStyle';
import { useLore } from '@/state/lore';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Status bar icons follow the active theme. */
function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

function Navigator() {
  const { colors } = useTheme();
  const ready = useLore((s) => s.ready);
  useWebSelectionStyle();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PatrickHand_400Regular,
  });
  const fontsDone = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontsDone && ready) SplashScreen.hideAsync().catch(() => {});
  }, [fontsDone, ready]);

  if (!fontsDone || !ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}>
      {/* Capture sheets rise from the bottom; the steps between them cross-fade; detail pages push in. */}
      <Stack.Screen name="record" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="update" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="answer" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="entry/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="processing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="saved" options={{ gestureEnabled: false }} />
      <Stack.Screen name="updated" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <ToastProvider>
          <Navigator />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
