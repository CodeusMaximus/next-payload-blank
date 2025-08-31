import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

// Collections / Globals
import { Orders } from './app/collections/Orders'
import { Users } from './app/collections/Users'          // ← see updated Users below
import { Media } from './app/collections/Media'          // ← see updated Media below (slug MUST be 'media')
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

/** Single source of truth for your public origin */
const PUBLIC_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'

/** Vercel Preview URL (added automatically in Preview deployments) */
const VERCEL_ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

/** CORS/CSRF allow-list — keep these EXACT */
const ORIGINS = [
  PUBLIC_URL,               // 👈 the domain you actually visit (e.g. https://alpergrocery.com)
  'http://localhost:3000',
  ...(VERCEL_ORIGIN ? [VERCEL_ORIGIN] : []),
]

/** Plugins (guard Blob so local/dev works without a token) */
const plugins = [
  payloadCloudPlugin(),
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { media: true }, // 'media' MUST match your Media.slug
          token: process.env.BLOB_READ_WRITE_TOKEN!,
          // clientUploads: true, // enable if you want direct-from-browser uploads
        }),
      ]
    : []),
]

export default buildConfig({
  serverURL: PUBLIC_URL,     // ✅ critical for absolute media URLs

  cors: ORIGINS,
  csrf: ORIGINS,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  collections: [
    Users,
    Media,
    Pages,
    Posts,
    Orders,
    Products,
    HeroSlides,
    Deli,
    BreakfastDinner,
    FAQs,
  ],
  globals: [Nav, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  db: mongooseAdapter({
    // Support either env name; set one in Vercel
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
  }),

  sharp,
  plugins,
})
