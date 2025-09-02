'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, FormEvent } from 'react'

interface MediaDoc {
  id?: string
  url?: string
  alt?: string
  filename?: string
}

interface SocialLink {
  platform: string
  customPlatform?: string
  url: string
  icon?: MediaDoc | string | null
}

interface QuickLink {
  label: string
  href: string
  openInNewTab?: boolean
}

interface ContactInfo {
  email?: string
  phone?: string
  address?: string
}

interface FooterData {
  id?: string
  text?: string
  copyright?: string
  socialLinks?: SocialLink[]
  quickLinks?: QuickLink[]
  contactInfo?: ContactInfo
  updatedAt?: string
  createdAt?: string
}

interface FooterProps {
  data?: FooterData | null
}

const getSocialIcon = (platform: string) => {
  const icons = {
    facebook: '📘',
    twitter: '🐦',
    instagram: '📷',
    linkedin: '💼',
    youtube: '📺',
    tiktok: '🎵',
    github: '🐙',
    other: '🔗',
  }
  return (icons as any)[platform] || '🔗'
}

export default function Footer({ data }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Safely compute address values once
  const addr = (data?.contactInfo?.address ?? '').trim()
  const hasAddr = addr.length > 0
  const encodedAddr = encodeURIComponent(addr)
  const mapSrc = hasAddr
    ? `https://www.google.com/maps?q=${encodedAddr}&output=embed`
    : null

  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      message: String(fd.get('message') || ''),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus({ ok: true, msg: 'Thanks! We’ll get back to you shortly.' })
      e.currentTarget.reset()
    } catch {
      setStatus({ ok: false, msg: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-white pt-10">
      <div className="container mx-auto px-4">
        {/* Top: About / Quick Links / Contact + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            {data?.text ? (
              <p className="text-gray-300 leading-relaxed">{data.text}</p>
            ) : (
              <p className="text-gray-400 leading-relaxed">
                Fresh groceries, deli favorites, and daily essentials — right in your neighborhood.
              </p>
            )}

            {/* Social */}
            {data?.socialLinks?.length ? (
              <div className="flex gap-4 mt-5">
                {data.socialLinks.map((social, idx) => {
                  const isMediaDoc =
                    !!social.icon &&
                    typeof social.icon === 'object' &&
                    'url' in (social.icon as any)

                  const displayName =
                    social.platform === 'other'
                      ? social.customPlatform || 'Social'
                      : social.platform.charAt(0).toUpperCase() + social.platform.slice(1)

                  const iconUrl = isMediaDoc ? (social.icon as MediaDoc).url : undefined
                  const iconAlt =
                    (isMediaDoc && (social.icon as MediaDoc).alt) ||
                    displayName ||
                    'Social media icon'

                  return (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                      aria-label={`Visit our ${displayName} page`}
                    >
                      {isMediaDoc && iconUrl ? (
                        <Image
                          src={iconUrl}
                          alt={iconAlt}
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                      ) : (
                        <span className="text-xl">
                          {getSocialIcon(social.platform)}
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            {data?.quickLinks?.length ? (
              <ul className="space-y-2">
                {data.quickLinks.map((link, idx) => (
                  <li key={idx}>
                    {link.openInNewTab ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400"> </p>
            )}
          </div>

          {/* Contact + Map */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>

            <div className="bg-gray-800/60 rounded-2xl p-5 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Contact form (client) */}
                <form className="space-y-3" onSubmit={onSubmit}>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input
                      name="name"
                      type="text"
                      className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800/60 text-white font-semibold px-4 py-2 transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>

                  {status && (
                    <p
                      className={`text-sm mt-2 ${
                        status.ok ? 'text-green-400' : 'text-rose-400'
                      }`}
                    >
                      {status.msg}
                    </p>
                  )}

                  {/* Direct contact info */}
                  <div className="mt-3 text-sm text-gray-300 space-y-1">
                    {data?.contactInfo?.email && (
                      <p>
                        Email:{' '}
                        <a
                          href={`mailto:${data.contactInfo.email}`}
                          className="text-white hover:underline"
                        >
                          {data.contactInfo.email}
                        </a>
                      </p>
                    )}
                    {data?.contactInfo?.phone && (
                      <p>
                        Phone:{' '}
                        <a
                          href={`tel:${data.contactInfo.phone.replace(/[^\d+]/g, '')}`}
                          className="text-white hover:underline"
                        >
                          {data.contactInfo.phone}
                        </a>
                      </p>
                    )}
                    {hasAddr && (
                      <p className="text-gray-400 whitespace-pre-line">
                        Address: {addr}
                      </p>
                    )}
                  </div>
                </form>

                {/* Map */}
                {mapSrc ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-gray-900">
                      <div className="aspect-[4/3] w-full">
                        <iframe
                          title="Location map"
                          src={mapSrc}
                          className="h-full w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Find us on the map</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-gray-900 p-4 text-gray-400">
                    Add your address in the CMS to show a map here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-gray-800 mt-10 py-6 text-center">
          <p className="text-gray-400 text-sm">
            {data?.copyright || `© ${currentYear} Alper Grocery. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
