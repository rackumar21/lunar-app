// Analytics wrapper — all tracking goes through here, never scattered posthog.capture() calls.
// If we ever switch from Posthog to something else, we change this file only.

import posthog from 'posthog-js';

export function initAnalytics() {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    // Don't track anything until we explicitly call identify() or capture()
    autocapture: false,
    // Don't send a pageview automatically — we'll track tab views ourselves
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
