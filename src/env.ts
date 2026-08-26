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
    SHOPIFY_REVALIDATION_SECRET: z.string().optional(),
    SITE_NAME: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_REVALIDATION_SECRET: process.env.SHOPIFY_REVALIDATION_SECRET,
    SITE_NAME: process.env.SITE_NAME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
