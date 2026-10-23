import { router, type Href } from 'expo-router';

/**
 * Goes back, or to `fallback` when there is nothing to go back to (a page reload on web, a deep
 * link). A bare router.back() in that situation throws "GO_BACK was not handled by any navigator".
 */
export function goBack(fallback: Href = '/(tabs)'): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
