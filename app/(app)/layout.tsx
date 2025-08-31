 import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import type { Nav, Footer as FooterType } from '@/payload-types'
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

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default async function AppLayout({ children }: { children: ReactNode }) {
  const payload = await getPayloadHMR({ config })
  const [navData, footerData] = await Promise.all([
    payload.findGlobal({ slug: 'nav', depth: 2 }) as Promise<Nav>,
    payload.findGlobal({ slug: 'footer', depth: 1 }) as Promise<FooterType>,
  ])

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <Providers>
            <Navbar data={navData} />
            <main className="flex-1  pt-16 md:pt-20">{children}</main>
            <Footer data={footerData} />
          </Providers>
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}