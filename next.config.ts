import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  // Keep mongoose out of the JS bundle — load from node_modules at runtime
  serverExternalPackages: ['mongoose'],

  // Exclude heavy build-time files from being traced into serverless functions
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/**',
      'node_modules/next/dist/compiled/**',
      'node_modules/next/dist/server/lib/router-server/**',
      'node_modules/sharp/**',
      'node_modules/esbuild/**',
      'node_modules/webpack/**',
      'node_modules/prettier/**',
      'node_modules/typescript/**',
      'node_modules/localtunnel/**',
      'node_modules/jest*/**',
      'node_modules/@jest/**',
      'node_modules/@testing-library/**',
      'node_modules/ts-jest/**',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
