// Analytics wrapper — all tracking goes through here, never scattered posthog.capture() calls.
// If we ever switch from Posthog to something else, we change this file only.

import posthog from 'posthog-js';

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) {
    console.warn('[Lunar] Posthog key missing — analytics disabled. Add VITE_POSTHOG_KEY to .env and Vercel.');
    return;
  }
  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
  });
}

export const analytics = {
  // Call on login — ties all future events to this user ID (UUID only, no name/email)
  identify: (userId) => {
    posthog.identify(userId);
  },

  // Call on logout — clears the user identity so events aren't wrongly attributed
  reset: () => {
    posthog.reset();
  },

  track: (event, properties = {}) => {
    posthog.capture(event, properties);
  },
};
