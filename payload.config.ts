 // payload.config.ts
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// ✅ add this import
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ✅ choose your public URL from env
const PUBLIC_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'

export default buildConfig({
  // ✅ critical for absolute media URLs in prod
  serverURL: PUBLIC_URL,

  // ✅ allow your frontend origins (use both apex + www)
  cors: [
    'https://alpergrocery.com',
    'https://www.alpergrocery.com',
    'http://localhost:3000',
  ],
  csrf: [
    'https://alpergrocery.com',
    'https://www.alpergrocery.com',
    'http://localhost:3000',
  ],

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  collections: [Users, Media, Pages, Posts, Orders, Products, HeroSlides, Deli, BreakfastDinner, FAQs],
  globals: [Nav, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({
    // you used DATABASE_URI, keep it consistent
    url: process.env.DATABASE_URI || '',
  }),
  sharp,

  plugins: [
    payloadCloudPlugin(),

    // ✅ Persistent storage for uploads on Vercel
    //    (replace 'media' below with your upload collection slug if different)
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN, // added by Vercel when you enable Blob storage
      // clientUploads: true, // enable if you want direct-from-browser uploads
    }),
  ],
})
