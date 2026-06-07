/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// Injected content via Sentry wizard below
import { withSentryConfig } from "@sentry/nextjs";

await import("./src/env.js");

/** @type {import("next").NextConfig} */
const coreConfig = {
  transpilePackages: [
    "@faker-js/faker",
    "@orpc/client",
    "@orpc/contract",
    "@orpc/experimental-pino",
    "@orpc/interop",
    "@orpc/openapi",
    "@orpc/server",
    "@orpc/shared",
    "@orpc/standard-server",
    "@orpc/standard-server-fetch",
    "@orpc/standard-server-node",
    "@orpc/standard-server-peer",
    "@orpc/tanstack-query",
    "@orpc/trpc",
    "@orpc/zod",
    "copy-anything",
    "is-what",
    "superjson",
    "validator",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

const config = withSentryConfig(coreConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "sanbi-swy",
  project: "sanbi",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js proxy, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Delete source maps after upload so client bundles do not expose them.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size.
    treeshake: {
      removeDebugLogging: true,
    },

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See: https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,
  },
});

export default config;
