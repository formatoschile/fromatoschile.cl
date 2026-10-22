import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // 100% in dev, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // SDK v11 collects bodies, headers, cookies, query params and user info by
  // default; cart/checkout traffic carries customer data, so opt out of all of it.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
  },
});
