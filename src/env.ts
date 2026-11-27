import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SHOPIFY_STORE_DOMAIN: z
      .string()
      .min(1)
      .refine((val) => !val.includes("[") && !val.includes("]"), {
        message:
          "SHOPIFY_STORE_DOMAIN includes brackets (ie. `[` and / or `]`). Please remove them.",
      }),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
    SHOPIFY_WEBHOOK_SECRET: z.string().min(1),
    // Admin API app credentials (Dev Dashboard, client credentials grant) —
    // only needed for generating product preview thumbnails.
    SHOPIFY_ADMIN_CLIENT_ID: z.string().min(1).optional(),
    SHOPIFY_ADMIN_CLIENT_SECRET: z.string().min(1).optional(),
    // Define in Vercel env vars; Vercel sends it as the cron's bearer token.
    CRON_SECRET: z.string().min(1).optional(),
    SITE_NAME: z.string().min(1),
    SENTRY_DSN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
    // Google Tag Manager web container. Set in Vercel's Production
    // environment ONLY, so previews and localhost never send data
    // (docs/plans/tracking-plan.md, phase 2). Unset = no GTM on the page.
    NEXT_PUBLIC_GTM_ID: z
      .string()
      .regex(/^GTM-[A-Z0-9]+$/)
      .optional(),
  },
  runtimeEnv: {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
    SHOPIFY_ADMIN_CLIENT_ID: process.env.SHOPIFY_ADMIN_CLIENT_ID,
    SHOPIFY_ADMIN_CLIENT_SECRET: process.env.SHOPIFY_ADMIN_CLIENT_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    SITE_NAME: process.env.SITE_NAME,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
