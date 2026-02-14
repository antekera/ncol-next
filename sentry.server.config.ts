// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: SENTRY_DSN,
  // Defined the environment for Sentry.
  environment: process.env.NODE_ENV,

  // Ignore localhost in development
  enabled: process.env.NODE_ENV !== 'development',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false
})
