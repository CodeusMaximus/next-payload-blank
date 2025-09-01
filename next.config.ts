// next.config.ts
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'alpergrocery.com' },
      { protocol: 'https', hostname: 'www.alpergrocery.com' },
      { protocol: 'https', hostname: '**.vercel-storage.com' }, // Blob
    ],
    // unoptimized: true, // (optional) flip on temporarily to debug image loading
  },
}

export default withPayload(nextConfig)
