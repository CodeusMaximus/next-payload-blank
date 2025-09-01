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

// Simplified URL handling
const PUBLIC_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://alpergrocery.com' : 'http://localhost:3000')

// Simple CORS origins
const ORIGINS = [
  'https://alpergrocery.com',
  'https://www.alpergrocery.com',
  'http://localhost:3000'
]

// Simplified plugins
const plugins = [
  payloadCloudPlugin(),
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: process.env.BLOB_READ_WRITE_TOKEN,
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
  
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  sharp,
  plugins,
})