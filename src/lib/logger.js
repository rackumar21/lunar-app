// Structured logger — every error gets a timestamp and context object.
// This makes it easy to diagnose what went wrong, when, and where.
// When we add Sentry (error monitoring), we add ONE line here and it catches everything.

export const logger = {
  error: (message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    console.error('[Lunar Error]', entry);
    // Future: Sentry.captureException or similar goes here
  },

  warn: (message, context = {}) => {
    console.warn('[Lunar Warn]', { timestamp: new Date().toISOString(), message, ...context });
  },

  info: (message, context = {}) => {
    console.log('[Lunar]', { timestamp: new Date().toISOString(), message, ...context });
  },
};
