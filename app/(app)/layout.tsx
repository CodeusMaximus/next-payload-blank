 // app/(app)/layout.tsx

import 'keen-slider/keen-slider.min.css'
 import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css' // ✅ site styles only affect the (app) subtree
import { Geist, Geist_Mono } from 'next/font/google'

// payload helpers
import { getPayload as getPayloadNode } from 'payload'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

// your app components/providers
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Providers from './components/Providers'
import { CartProvider } from '../lib/cart/cart-context'
import CartSidebar from './components/cart/cart-sidebar'

export const metadata: Metadata = {
  title: 'AlperGrocery.com',
  description: 'The premiere grocery store of Staten Island',
}

export const dynamic = 'force-dynamic' // you fetch globals
export const runtime = 'nodejs'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

// Use HMR in dev, node in prod
const getPayloadSafe =
  process.env.NODE_ENV === 'development'
    ? () => getPayloadHMR({ config })
    : () => getPayloadNode({ config })

export default async function AppLayout({ children }: { children: ReactNode }) {
  const payload = await getPayloadSafe()
  const p: any = payload // loosen just here if your types are strict

  const [navData, footerData] = await Promise.all([
    p.findGlobal({ slug: 'nav', depth: 2 }),
    p.findGlobal({ slug: 'footer', depth: 1 }),
  ])

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <Providers>
            <Navbar data={navData} />
            <main className="flex-1 pt-16 md:pt-20">{children}</main>
            <Footer data={footerData} />
          </Providers>
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
