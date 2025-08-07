// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://1549fc718b029bc85a39dc02d18adacc@o4509706557915136.ingest.us.sentry.io/4509738327539712",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Filter out browser extension errors before sending to Sentry
  beforeSend(event, hint) {
    // Check if the error originates from an extension
    if (
      event.request?.url?.startsWith('chrome-extension://') ||
      event.request?.url?.startsWith('moz-extension://') ||
      event.request?.url?.startsWith('safari-extension://') ||
      event.request?.url?.startsWith('edge-extension://')
    ) {
      console.log('Filtered out extension error (request URL):', event.message || 'Unknown error');
      return null; // Discard the event
    }

    // Check the original error's stack trace for extension patterns
    const error = hint.originalException as Error;
    if (error && error.stack) {
      const stackTrace = error.stack;
      const extensionPatterns = [
        /chrome-extension:\/\//,
        /moz-extension:\/\//,
        /safari-extension:\/\//,
        /edge-extension:\/\//,
        /extensions\//,
        /content_scripts\//,
        /background_scripts\//,
        /manifest\.json/
      ];
      
      for (const pattern of extensionPatterns) {
        if (pattern.test(stackTrace)) {
          console.log('Filtered out extension error (raw stack trace):', event.message || 'Unknown error');
          return null;
        }
      }
    }

    // Alternative check based on Sentry's parsed stack trace
    if (
      event.exception?.values?.some(value =>
        value.stacktrace?.frames?.some(frame =>
          frame.filename && /^(chrome|moz|safari|edge)-extension:\/\//.test(frame.filename)
        )
      )
    ) {
      console.log('Filtered out extension error (parsed stack trace):', event.message || 'Unknown error');
      return null;
    }

    // Check if any stack frame contains extension-related paths
    if (
      event.exception?.values?.some(value =>
        value.stacktrace?.frames?.some(frame =>
          frame.filename && (
            frame.filename.includes('chrome-extension://') ||
            frame.filename.includes('moz-extension://') ||
            frame.filename.includes('safari-extension://') ||
            frame.filename.includes('edge-extension://') ||
            frame.filename.includes('extensions/') ||
            frame.filename.includes('content_scripts/') ||
            frame.filename.includes('background_scripts/') ||
            frame.filename.includes('manifest.json')
          )
        )
      )
    ) {
      console.log('Filtered out extension error (extension paths):', event.message || 'Unknown error');
      return null;
    }

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;