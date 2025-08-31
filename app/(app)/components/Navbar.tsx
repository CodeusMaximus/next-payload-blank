 // components/Navbar.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Search, User, Bell, Menu, X, Phone, Mail, ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import CartButton from './cart/cart-button'

const OrderModal = dynamic(() => import('./OrderModal'), { ssr: false })

type MediaDoc = { url?: string; alt?: string }

type ChildTarget = 'custom' | 'products' | 'deli' | 'breakfastandlunch'
type SubLink = {
  label: string
  target: ChildTarget
  categoryKey?: string
  href?: string
  openInNewTab?: boolean
}
type NavItem = {
  label: string
  href?: string
  openInNewTab?: boolean
  children?: SubLink[]
}
type NavData = { logo?: MediaDoc | string; links?: NavItem[] }
type ContactInfo = { phone?: string; email?: string }

function isExternal(href: string) {
  return /^https?:\/\//i.test(href)
}

function childHref(_parent: NavItem, child: SubLink): string {
  if (child.target === 'products' && child.categoryKey) {
    return `/category/${encodeURIComponent(child.categoryKey)}`
  }
  if (child.target === 'deli' && child.categoryKey) {
    return `/deli?cat=${encodeURIComponent(child.categoryKey)}`
  }
  if (child.target === 'breakfastandlunch' && child.categoryKey) {
    return `/breakfastandlunch?cat=${encodeURIComponent(child.categoryKey)}`
  }
  return child.href || '#'
}

export default function Navbar({
  data,
  contact,
}: {
  data?: NavData
  contact?: ContactInfo
}) {
  const router = useRouter()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isOrderOpen, setIsOrderOpen] = useState(false)
  const [query, setQuery] = useState('') // ✅ search query state

  // Mobile dropdown control
  const [openMobileDropdown, setOpenMobileDropdown] = useState<number | null>(null)

  // Desktop dropdown control (gapless + delayed close)
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<number | null>(null)
  const [ddCloseTimer, setDdCloseTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  function openDD(i: number) {
    if (ddCloseTimer) clearTimeout(ddCloseTimer)
    setOpenDesktopDropdown(i)
  }
  function scheduleCloseDD() {
    if (ddCloseTimer) clearTimeout(ddCloseTimer)
    setDdCloseTimer(setTimeout(() => setOpenDesktopDropdown(null), 150))
  }

  const { isSignedIn, user } = useUser()
  const role = (user?.publicMetadata as any)?.role
  const emailAddr =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress
  const isAdmin = role === 'admin' || emailAddr === 'dfsturge@gmail.com'

  // Phone/Email fallbacks (so icons show even if `contact` prop is omitted)
  const fallbackPhone = process.env.NEXT_PUBLIC_STORE_PHONE || ''
  const fallbackEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || ''
  const phoneDisplay = contact?.phone ?? fallbackPhone
  const emailDisplay = contact?.email ?? fallbackEmail

  const phoneHref = phoneDisplay ? `tel:${phoneDisplay.replace(/[^\d+]/g, '')}` : undefined
  const mailHref = emailDisplay ? `mailto:${emailDisplay}` : undefined

  const isMediaDoc =
    typeof data?.logo === 'object' && data?.logo !== null && 'url' in (data as any).logo
  const logoUrl: string | undefined = isMediaDoc ? (data!.logo as MediaDoc).url : undefined
  const logoAlt: string =
    isMediaDoc && (data!.logo as MediaDoc).alt
      ? ((data!.logo as MediaDoc).alt as string)
      : 'Alper Grocery'

  const toggleMenu = () => setIsMenuOpen(v => !v)
  const toggleSearch = () => setIsSearchOpen(v => !v)

  // ✅ Submit helper to navigate to /search?q=...
  function submitSearch() {
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    // close any open UI
    setIsSearchOpen(false)
    setIsMenuOpen(false)
  }

  // Compose CMS links + default inserts (Home, BL, Deli, Order Now, Dashboard)
  const navItems: NavItem[] = useMemo(() => {
    const base = (data?.links ?? []) as NavItem[]

    const ensure = (arr: NavItem[], label: string, href: string, children?: SubLink[]) => {
      const exists = arr.find(l => l.label.toLowerCase() === label.toLowerCase())
      return exists ? arr : [...arr, { label, href, children }]
    }

    let list = base.filter(
      l => !['home', 'order', 'order now', 'dashboard'].includes(l.label.toLowerCase())
    )

    list = ensure(list, 'Home', '/')
    list = ensure(list, 'Breakfast/Lunch', '/breakfastandlunch')
    list = ensure(list, 'Deli', '/deli')
    list = ensure(list, 'Order Now', '/order')
    if (isAdmin) list = ensure(list, 'Dashboard', '/dashboard')

    list.sort((a, b) =>
      a.label.toLowerCase() === 'home' ? -1 : b.label.toLowerCase() === 'home' ? 1 : 0
    )

    return list
  }, [data?.links, isAdmin])

  const renderTopItem = (item: NavItem, idx: number) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const isOrder = ['order', 'order now'].includes(item.label.toLowerCase())

    if (isOrder) {
      return isSignedIn ? (
        <button
          key={idx}
          onClick={() => setIsOrderOpen(true)}
          className="relative text-white hover:text-red-400 transition-colors duration-300 group py-2"
        >
          Order Now
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
        </button>
      ) : (
        <SignInButton key={idx} mode="modal">
          <button className="relative text-white hover:text-red-400 transition-colors duration-300 group py-2">
            Order Now
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
          </button>
        </SignInButton>
      )
    }

    if (!hasChildren) {
      const external = !!item.href && isExternal(item.href)
      const baseClass =
        'relative text-white hover:text-red-400 transition-colors duration-300 group py-2'
      return item.href ? (
        external ? (
          <a key={idx} className={baseClass} href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
          </a>
        ) : (
          <Link key={idx} className={baseClass} href={item.href}>
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
          </Link>
        )
      ) : (
        <span key={idx} className={baseClass}>{item.label}</span>
      )
    }

    // Desktop dropdown (gapless + hover bridge + close delay + focus + click)
    return (
      <div
        key={idx}
        className="
          relative group
          before:absolute before:top-full before:left-0 before:h-3 before:w-full before:content-['']
        "
        onMouseEnter={() => openDD(idx)}
        onMouseLeave={scheduleCloseDD}
        onFocusCapture={() => openDD(idx)}
        onBlurCapture={scheduleCloseDD}
      >
        <button
          className="inline-flex items-center gap-1 text-white hover:text-red-400 transition-colors py-2"
          aria-haspopup="menu"
          aria-expanded={openDesktopDropdown === idx}
          onClick={() =>
            setOpenDesktopDropdown(openDesktopDropdown === idx ? null : idx)
          }
        >
          {item.label}
          <ChevronDown
            className={`h-4 w-4 mt-[1px] transition-transform ${openDesktopDropdown === idx ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className={`
            absolute left-0 top-full
            min-w-[260px] rounded-xl bg-gray-900 border border-white/10 shadow-2xl z-[120]
            transition-[opacity,transform] duration-150
            ${openDesktopDropdown === idx ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}
          `}
          role="menu"
        >
          <ul className="py-2">
            {item.children!.map((c, i) => {
              const href = childHref(item, c)
              const external = isExternal(href) || c.openInNewTab
              const common = 'block w-full text-left px-4 py-2 text-gray-200 hover:text-white hover:bg-white/5'
              return external ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={common} role="menuitem">
                  {c.label}
                </a>
              ) : (
                <Link key={i} href={href} className={common} role="menuitem">
                  {c.label}
                </Link>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 text-white shadow-lg border-b border-white/10 z-[500]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-18 md:h-20">
          {/* Logo / Home */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {logoUrl ? (
                <Image src={logoUrl} alt={logoAlt} width={120} height={50} className="w-auto" />
              ) : (
                <span className="font-bold text-xl text-white">Alper Grocery</span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(renderTopItem)}
          </div>

          {/* ✅ Search Bar - Desktop (navigates to /search?q=...) */}
          <form
            onSubmit={(e) => { e.preventDefault(); submitSearch() }}
            className="hidden md:flex items-center bg-gray-800 rounded-full px-4 py-2 flex-1 max-w-md mx-8"
            role="search"
          >
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1"
              aria-label="Search products"
            />
          </form>

          {/* Right cluster (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {phoneHref && (
              <a href={phoneHref} className="p-2 rounded-full hover:bg-gray-800" title={phoneDisplay}>
                <Phone className="h-5 w-5" />
              </a>
            )}
            {mailHref && (
              <a href={mailHref} className="p-2 rounded-full hover:bg-gray-800" title={emailDisplay}>
                <Mail className="h-5 w-5" />
              </a>
            )}
            <button className="relative p-2 hover:bg-gray-800 rounded-full group" aria-label="Notifications">
              <Bell className="h-6 w-6 group-hover:text-red-400 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-2 w-2"></span>
            </button>
            <CartButton />
            {isSignedIn ? <UserButton afterSignOutUrl="/" /> : (
              <SignInButton mode="modal">
                <button className="p-2 hover:bg-gray-800 rounded-full group" aria-label="Sign in">
                  <User className="h-6 w-6 group-hover:text-red-400 transition-colors" />
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile header actions (Search, Cart, Phone, Mail, Menu) */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleSearch} className="p-2 hover:bg-gray-800 rounded-full" aria-label="Search">
              <Search className="h-6 w-6" />
            </button>

            <CartButton />

            {phoneHref && (
              <a href={phoneHref} aria-label="Call" className="p-2 hover:bg-gray-800 rounded-full">
                <Phone className="h-6 w-6" />
              </a>
            )}
            {mailHref && (
              <a href={mailHref} aria-label="Email" className="p-2 hover:bg-gray-800 rounded-full">
                <Mail className="h-6 w-6" />
              </a>
            )}

            <button onClick={toggleMenu} className="p-2 hover:bg-gray-800 rounded-full" aria-label="Menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Search Bar (also navigates to /search?q=...) */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <form
              onSubmit={(e) => { e.preventDefault(); submitSearch() }}
              className="flex items-center bg-gray-800 rounded-full px-4 py-2"
              role="search"
            >
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1"
                autoFocus
                aria-label="Search products"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile full-screen menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[700] md:hidden">
          <div className="absolute inset-0 flex flex-col">
            {/* Header (blue/desktop-like) */}
            <div className="relative flex items-center justify-center px-5 h-16 bg-gray-900 text-white">
              {logoUrl ? (
                <Image src={logoUrl} alt={logoAlt} width={120} height={48} className="w-auto" />
              ) : (
                <span className="font-bold text-lg">Alper Grocery</span>
              )}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body (white/red) */}
            <div className="flex-1 bg-white text-red-700 flex flex-col">
              {/* Contact quick actions */}
              <div className="flex gap-3 px-5 py-4 border-b border-red-200">
                {phoneHref && (
                  <a href={phoneHref} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
                {mailHref && (
                  <a href={mailHref} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
              </div>

              {/* Centered nav list */}
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ul className="space-y-3">
                  {navItems.map((item, idx) => {
                    const hasChildren = Array.isArray(item.children) && item.children.length > 0
                    const isOrder = ['order', 'order now'].includes(item.label.toLowerCase())
                    const isOpen = openMobileDropdown === idx

                    if (isOrder) {
                      return isSignedIn ? (
                        <li key={idx} className="text-center">
                          <button
                            onClick={() => { setIsOrderOpen(true); setIsMenuOpen(false) }}
                            className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                          >
                            Order Now
                          </button>
                        </li>
                      ) : (
                        <li key={idx} className="text-center">
                          <SignInButton mode="modal">
                            <button
                              onClick={() => setIsMenuOpen(false)}
                              className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                            >
                              Order Now
                            </button>
                          </SignInButton>
                        </li>
                      )
                    }

                    if (!hasChildren) {
                      const external = !!item.href && isExternal(item.href)
                      const cls = 'block w-full text-center px-4 py-3 rounded-xl border border-red-200 text-red-800 hover:bg-red-50'
                      return item.href ? (
                        <li key={idx} className="text-center">
                          {external ? (
                            <a href={item.href} className={cls} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
                          ) : (
                            <Link href={item.href} className={cls} onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
                          )}
                        </li>
                      ) : (
                        <li key={idx} className="text-center">
                          <span className="block w-full text-center px-4 py-3 rounded-xl border border-red-100 text-red-400">{item.label}</span>
                        </li>
                      )
                    }

                    // has children (collapsible)
                    return (
                      <li key={idx} className="text-center">
                        <button
                          onClick={() => setOpenMobileDropdown(isOpen ? null : idx)}
                          className="w-full px-4 py-3 rounded-xl border border-red-200 text-red-800 hover:bg-red-50 inline-flex items-center justify-center gap-2"
                        >
                          <span>{item.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <div className={`grid transition-all overflow-hidden ${isOpen ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'}`}>
                          <div className="min-h-0">
                            <ul className="space-y-2 pt-1">
                              {item.children!.map((c, i) => {
                                const href = childHref(item, c)
                                const external = isExternal(href) || c.openInNewTab
                                const childClass = 'block w-full text-center px-4 py-2 rounded-lg text-red-700 hover:bg-red-50'
                                return external ? (
                                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={childClass} onClick={() => setIsMenuOpen(false)}>
                                    {c.label}
                                  </a>
                                ) : (
                                  <Link key={i} href={href} className={childClass} onClick={() => setIsMenuOpen(false)}>
                                    {c.label}
                                  </Link>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Bottom row */}
              <div className="px-5 py-4 border-t border-red-200 flex items-center justify-between">
                <CartButton />
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Sign in</button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        onSubmit={(details) => { console.log('order details', details) }}
      />
    </nav>
  )
}
