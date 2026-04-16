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
  },
});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withPWA(config);
