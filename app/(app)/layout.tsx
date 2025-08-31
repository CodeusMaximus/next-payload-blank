// app/(app)/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getPayload } from 'payload'
import config from '@payload-config'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Providers from './components/Providers'
import { CartProvider } from '../lib/cart/cart-context'
import CartSidebar from './components/cart/cart-sidebar'

export const metadata: Metadata = {
  title: 'My Site',
  description: 'Powered by Payload + Next',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default async function AppLayout({ children }: { children: ReactNode }) {
  const payload = await getPayload({ config })
  const p: any = payload // 👈 loosen just this callsite

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
