import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // 100% in dev, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Local-variable capture surfaces cart/checkout identifiers (cart IDs,
  // merchandise IDs, line items) sitting in scope at the exception site —
  // only enable it outside production, where that data isn't real customer data.
  includeLocalVariables: process.env.NODE_ENV !== "production",

  enableLogs: true,
});
