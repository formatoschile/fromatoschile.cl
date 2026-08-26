import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // 100% in dev, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  includeLocalVariables: true,

  enableLogs: true,
});
