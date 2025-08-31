'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQ = {
  id: string
  question: string
  answer: any // richText JSON; we’ll render safely
  category?: 'general' | 'ordering' | 'delivery' | 'payments' | 'returns'
  isPublished?: boolean
  sortOrder?: number
}

const CATEGORY_LABEL: Record<NonNullable<FAQ['category']>, string> = {
  general: 'General',
  ordering: 'Ordering',
  delivery: 'Delivery',
  payments: 'Payments',
  returns: 'Returns/Refunds',
}

/* ---------- Lexical/Slate-safe renderer helpers ---------- */

function isLexical(obj: any): obj is { root: { children: any[] } } {
  return !!obj && typeof obj === 'object' && obj.root && Array.isArray(obj.root.children)
}

function isSlateBlocks(arr: any): arr is { children?: any[]; text?: string }[] {
  return Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object' && 'children' in arr[0]
}

function textFromNode(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.text) return node.text
  if (Array.isArray(node.children)) return node.children.map(textFromNode).join('')
  return ''
}

function parseHeadingLevel(n: any): 1 | 2 | 3 | 4 | 5 | 6 {
  let lvl = 3
  if (typeof n.tag === 'string') {
    const m = n.tag.match(/^h([1-6])$/i)
    if (m) lvl = Number(m[1])
  }
  if (typeof n.type === 'string') {
    const m = n.type.match(/^heading([1-6])$/)
    if (m) lvl = Number(m[1])
  }
  if (typeof n.tag === 'number') {
    lvl = n.tag
  }
  lvl = Math.min(6, Math.max(1, lvl))
  return (lvl as unknown) as 1 | 2 | 3 | 4 | 5 | 6
}

function renderLexicalChildren(children: any[], keyPrefix = '') {
  return children.map((n, i) => {
    const key = `${keyPrefix}${i}`

    // Paragraph-like
    if (n.type === 'paragraph') {
      return <p key={key}>{textFromNode(n)}</p>
    }

    // Headings
    if (typeof n.type === 'string' && n.type.startsWith('heading')) {
      const lvl = parseHeadingLevel(n)
      const headingTag = (['h1','h2','h3','h4','h5','h6'][lvl - 1]) as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'
      return React.createElement(headingTag, { key }, textFromNode(n))
    }

    // Lists
    if (n.type === 'list') {
      const isOrdered = n.listType === 'number' || n.tag === 'ol'
      const Tag: 'ol' | 'ul' = isOrdered ? 'ol' : 'ul'
      return (
        <Tag key={key} className="list-inside ml-5">
          {(n.children || []).map((li: any, j: number) => (
            <li key={`${key}-li-${j}`}>{textFromNode(li)}</li>
          ))}
        </Tag>
      )
    }

    // Links (node-level)
    if (n.type === 'link') {
      const url = n.url || n.fields?.url
      return (
        <p key={key}>
          <a href={url} className="underline text-blue-600 dark:text-blue-400">
            {textFromNode(n)}
          </a>
        </p>
      )
    }

    // Fallback
    return <p key={key}>{textFromNode(n)}</p>
  })
}

function renderAnswer(answer: any) {
  // 1) Plain string
  if (typeof answer === 'string') {
    return <p>{answer}</p>
  }

  // 2) Slate-ish array of blocks
  if (isSlateBlocks(answer)) {
    return (answer as any[]).map((block, i) => <p key={i}>{textFromNode(block)}</p>)
  }

  // 3) Payload Lexical JSON
  if (isLexical(answer)) {
    return renderLexicalChildren(answer.root.children, 'lex-')
  }

  // 4) Empty lexical root
  if (answer && typeof answer === 'object' && answer.root && Array.isArray(answer.root.children) && answer.root.children.length === 0) {
    return <p>—</p>
  }

  // 5) Unknown shape
  return <p>—</p>
}

/* ---------- Page Component ---------- */

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/faqs?limit=200&depth=0&where[isPublished][equals]=true&sort=category,sortOrder,question')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (alive) setFaqs(data?.docs ?? [])
      } catch (e: any) {
        if (alive) setError(e?.message || 'Failed to load FAQs')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, FAQ[]>()
    for (const f of faqs) {
      const key = f.category || 'general'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(f)
    }
    return Array.from(map.entries())
  }, [faqs])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Answers about ordering, delivery, payments, and more.
        </p>

        {loading && <div className="text-gray-500 dark:text-gray-400">Loading…</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && grouped.map(([cat, items]) => (
          <section key={cat} className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] ?? 'General'}
            </h2>

            <div className="divide-y divide-gray-200/70 dark:divide-white/10 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
              {items.map((f) => {
                const isOpen = open === f.id
                return (
                  <div key={f.id} className="group">
                    <button
                      onClick={() => setOpen(isOpen ? null : f.id)}
                      className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{f.question}</span>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 text-gray-700 dark:text-gray-300">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {renderAnswer(f.answer)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
