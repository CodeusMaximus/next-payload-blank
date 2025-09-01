// next.config.ts
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // --- DEV (Payload/Next running locally) ---
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/api/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/api/**' },

      // If your Payload dev server runs on a different port, add it too:
      // { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/media/**' },

      // --- PROD domains serving your media ---
      { protocol: 'https', hostname: 'alpergrocery.com', pathname: '/api/**' },
      { protocol: 'https', hostname: 'www.alpergrocery.com', pathname: '/api/**' },

      // Vercel Blob (use * not ** for subdomain wildcard)
      { protocol: 'https', hostname: '*.vercel-storage.com', pathname: '/**' },
    ],
    // Optionally bypass optimization in dev while you tweak:
    // unoptimized: process.env.NODE_ENV !== 'production',
  },
}

export default withPayload(nextConfig)
