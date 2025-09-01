import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// NOTE: we will dynamically load the blob plugin below to avoid white screens
// import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

// Use path mapping
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

import { createRequire } from 'module' // ✅ lets us try/catch require in ESM
const require = createRequire(import.meta.url)

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ---- Dynamically & safely add the Blob plugin (won’t break admin) ----
const plugins: any[] = [payloadCloudPlugin()]

if (process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    // Require at runtime so a missing/mismatched package doesn't blow up the admin
    // Make sure @payloadcms/storage-vercel-blob version matches your payload version.
    const { vercelBlobStorage } = require('@payloadcms/storage-vercel-blob')
    plugins.push(
      vercelBlobStorage({
        collections: { media: true },     // <-- MUST match Media.slug
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        clientUploads: true,              // ✅ direct-to-Blob (bypasses 4.5MB limit)
      })
    )
    // eslint-disable-next-line no-console
    console.log('[Payload] Vercel Blob storage enabled')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[Payload] Blob plugin not loaded:', (err as Error)?.message)
    // We proceed without Blob to avoid breaking admin
  }
}

// ---------------------------------------------------------------------

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Media, Pages, Posts, Orders, Products, HeroSlides, Deli, BreakfastDinner, FAQs],
  globals: [Nav, Footer],

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  sharp,
  plugins,
})
