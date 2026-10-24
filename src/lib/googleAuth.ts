import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/state/lore';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Without Google client IDs, development builds sign in with a real account on the local backend instead. */
const DEV_SIGN_IN = !WEB_CLIENT_ID;

export type SignInResult = { status: 'ok'; profile: Profile } | { status: 'cancelled' } | { status: 'error'; message: string };

/** Dev-only account, created on first use, for when Google client IDs aren't configured. */
const DEV_EMAIL = 'dev@canonevent.local';
const DEV_PASSWORD = 'dev-password-123';

async function signInDevUser(): Promise<SignInResult> {
  if (!__DEV__) return { status: 'error', message: 'Google sign-in is not configured.' };
  let { error } = await supabase.auth.signInWithPassword({ email: DEV_EMAIL, password: DEV_PASSWORD });
  if (error) {
    // First run: the account doesn't exist yet (local Supabase has email confirmation off).
    ({ error } = await supabase.auth.signUp({ email: DEV_EMAIL, password: DEV_PASSWORD }));
  }
  if (error) return { status: 'error', message: `Dev sign-in failed: ${error.message}` };
  return { status: 'ok', profile: { name: 'Dev User', email: DEV_EMAIL } };
}

/** The native module is loaded lazily so the dev sign-in path also works in Expo Go. */
const loadGoogle = async () => {
  const google = await import('@react-native-google-signin/google-signin');
  google.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
  return google;
};

/**
 * The native Google module has no web implementation, so web uses Supabase's OAuth redirect.
 * The page navigates away to Google and back; `profileFromSession` picks the result up on return.
 */
async function signInWithGoogleWeb(): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/onboarding` },
  });
  if (error) return { status: 'error', message: 'Couldn’t sign in with Google. Try again.' };
  return { status: 'cancelled' };
}

/** The signed-in Google user from the stored session, if any (used after the web OAuth redirect). */
export async function profileFromSession(): Promise<Profile | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user?.email || user.app_metadata.provider !== 'google') return null;
  const meta: Record<string, string | undefined> = user.user_metadata;
  return { name: meta.full_name ?? meta.name ?? '', email: user.email, photoUri: meta.avatar_url ?? meta.picture };
}

/** Opens the Google account picker and maps the result to our profile shape. */
export async function signInWithGoogle(): Promise<SignInResult> {
  if (Platform.OS === 'web') return signInWithGoogleWeb();
  if (DEV_SIGN_IN) {
    return signInDevUser();
  }
  try {
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = await loadGoogle();
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return { status: 'cancelled' };
      const { name, email, photo } = response.data.user;
      // The backend identifies users by their Supabase session, so Google's ID token is exchanged for one.
      const { idToken } = response.data;
      if (!idToken) return { status: 'error', message: 'Google did not return an ID token.' };
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) return { status: 'error', message: 'Couldn’t sign in. Try again.' };
      return { status: 'ok', profile: { name: name ?? '', email, photoUri: photo ?? undefined } };
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) return { status: 'cancelled' };
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return { status: 'error', message: 'Google Play Services is missing or out of date.' };
        }
      }
      throw error;
    }
  } catch {
    return { status: 'error', message: 'Couldn’t sign in with Google. Try again.' };
  }
}

export function signOutOfGoogle(): void {
  void supabase.auth.signOut();
  if (DEV_SIGN_IN || Platform.OS === 'web') return;
  loadGoogle()
    .then(({ GoogleSignin }) => GoogleSignin.signOut())
    .catch(() => {});
}
