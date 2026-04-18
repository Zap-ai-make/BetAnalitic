/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds and Vercel deployments.
 */
if (!process.env.SKIP_ENV_VALIDATION && process.env.DATABASE_URL) {
  await import("./src/env.js");
}

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB max cache size
    runtimeCaching: [
      {
        // App shell: Cache-First (HTML, CSS, JS bundles)
        urlPattern: /^https?.*\.(html|css|js)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "app-shell",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // Images: Cache-First with 30 days expiration
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // API responses: Stale-While-Revalidate
        urlPattern: /^https?:\/\/.*\/api\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-responses",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // tRPC API: Stale-While-Revalidate
        urlPattern: /\/api\/trpc\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "trpc-api",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
      {
        // Match data: Network-First with fallback
        urlPattern: /\/(matches|live)\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "match-data",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },
      {
        // Static assets: Cache-First
        urlPattern: /\/_next\/static\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
    ],
  },
});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withPWA(config);
