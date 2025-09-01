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

// Fixed: Use explicit domain for production
const PUBLIC_URL = process.env.NODE_ENV === 'production' 
  ? 'https://alpergrocery.com'
  : 'http://localhost:3000'

// Vercel Preview URL 
const VERCEL_ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

// CORS/CSRF origins
const ORIGINS = [
  PUBLIC_URL,
  'https://alpergrocery.com',  // Explicit production domain
  'http://localhost:3000',
  ...(VERCEL_ORIGIN ? [VERCEL_ORIGIN] : []),
]

// Debug logging for production
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Payload Config Debug:')
  console.log('PUBLIC_URL:', PUBLIC_URL)
  console.log('ORIGINS:', ORIGINS)
  console.log('DATABASE_URI present:', !!process.env.DATABASE_URI)
  console.log('PAYLOAD_SECRET present:', !!process.env.PAYLOAD_SECRET)
  console.log('BLOB_TOKEN present:', !!process.env.BLOB_READ_WRITE_TOKEN)
}

const plugins = [
  payloadCloudPlugin(),
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        }),
      ]
    : []),
]

export default buildConfig({
  serverURL: PUBLIC_URL,
  
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
  
  // Make sure this is set properly
  secret: process.env.PAYLOAD_SECRET!,
  
  typescript: { 
    outputFile: path.resolve(dirname, 'payload-types.ts') 
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  sharp,
  plugins,
})