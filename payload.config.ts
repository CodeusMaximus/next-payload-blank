import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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

const PUBLIC_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'

const ORIGINS = [
  'https://alpergrocery.com',
  'https://www.alpergrocery.com',
  // add preview URL if you use it, e.g. `https://<project>-<hash>.vercel.app`
  'http://localhost:3000',
]

export default buildConfig({
  // IMPORTANT so the Admin knows absolute API endpoints and image URLs
  serverURL: PUBLIC_URL,

  cors: ORIGINS,
  csrf: ORIGINS,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  collections: [
    Users, Media, Pages, Posts, Orders, Products, HeroSlides, Deli, BreakfastDinner, FAQs,
  ],
  globals: [Nav, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  sharp,

  plugins: [
    payloadCloudPlugin(),
    // Attach Blob storage only when the token is present
    ...(process.env.BLOB_READ_WRITE_TOKEN ? [
      vercelBlobStorage({
        collections: { media: true },      // your upload collection slug MUST be "media"
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        clientUploads: true,               // <-- this enables direct-from-browser streaming
      }),
    ] : []),
  ],
})
