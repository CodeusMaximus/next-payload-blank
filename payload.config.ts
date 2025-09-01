import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Posts, Orders, Products, HeroSlides,Deli, BreakfastDinner, FAQs],
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
  plugins: [
    payloadCloudPlugin(),
  ],
})