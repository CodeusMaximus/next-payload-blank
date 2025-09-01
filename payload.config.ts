// payload.config.ts
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// NOTE: don't import blob plugin at top; we load it safely below.
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Collections / Globals
import { Orders } from './app/collections/Orders'
import { Users } from './app/collections/Users'
import { Media } from './app/collections/Media'
import Pages from './app/collections/Pages'
import Products from './app/collections/Products'
import HeroSlides from './app/collections/HeroSlides'
import { Posts } from './app/collections/Post'
import Nav from './app/globals/Nav'
import Footer from './app/globals/Footer'
import FAQs from './app/collections/FAQs'
import BreakfastDinner from './app/collections/BreakfastDinner'
import Deli from './app/collections/Deli'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Keep your current, working behavior
const plugins: any[] = [payloadCloudPlugin()]

// Add Blob only if token exists, and never crash if import fails
if (process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    const { vercelBlobStorage } = require('@payloadcms/storage-vercel-blob')
    plugins.push(
      vercelBlobStorage({
        collections: { media: true },   // MUST match Media.slug
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        clientUploads: true,            // direct-to-Blob (bypasses 4.5MB serverless limit)
      })
    )
    console.log('[Payload] Vercel Blob storage enabled')
  } catch (err: any) {
    console.warn('[Payload] Blob plugin not loaded:', err?.message)
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Pages, Posts, Orders, Products, HeroSlides, Deli, BreakfastDinner, FAQs],
  globals: [Nav, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  sharp,
  plugins,
})
