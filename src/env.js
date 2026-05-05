import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_DATABASE_URL_HERE"),
        "You forgot to change the default URL"
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AUTH_SECRET: z.string().min(1),
    AUTH_TRUST_HOST: z.string().optional(),
    // BetAnalytic API
    BETANALYTIC_API_URL: z.string().url().optional(),
    BETANALYTIC_INTERNAL_SECRET: z.string().optional(),
    BETANALYTIC_ADMIN_KEY: z.string().optional(),
    BETANALYTIC_JWT_SECRET: z.string().optional(),
    OLLAMA_BASE_URL: z.string().url().optional(),
    SPORTMONKS_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    API_SECRET: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    VERCEL_URL: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ABLY_KEY: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    // BetAnalytic API
    BETANALYTIC_API_URL: process.env.BETANALYTIC_API_URL,
    BETANALYTIC_INTERNAL_SECRET: process.env.BETANALYTIC_INTERNAL_SECRET,
    BETANALYTIC_ADMIN_KEY: process.env.BETANALYTIC_ADMIN_KEY,
    BETANALYTIC_JWT_SECRET: process.env.BETANALYTIC_JWT_SECRET,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    SPORTMONKS_API_KEY: process.env.SPORTMONKS_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    API_SECRET: process.env.API_SECRET,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_ABLY_KEY: process.env.NEXT_PUBLIC_ABLY_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
