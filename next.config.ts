// next.config.ts
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow Next/Image to optimize files coming from your site and Vercel Blob
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'alpergrocery.com' },
      { protocol: 'https', hostname: 'www.alpergrocery.com' },
      { protocol: 'https', hostname: '**.vercel-storage.com' }, // Vercel Blob
      // If you ever switch to S3/R2, keep these:
      // { protocol: 'https', hostname: '**.amazonaws.com' },
      // { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
    ],
    // TEMPORARY escape hatch during debugging:
    // unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === '1',
  },

  // If you run a custom Node server (rare on Vercel), keep this in mind:
  // output: 'standalone',
  // experimental: {
  //   serverActions: { bodySizeLimit: '10mb' }, // only if you hit upload size limits
  // },
}

// If your payload.config.ts is not in the root, set configPath:
// export default withPayload(nextConfig, { configPath: require.resolve('./payload.config.ts') })
export default withPayload(nextConfig)
