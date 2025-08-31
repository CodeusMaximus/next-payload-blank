 'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Scale } from 'lucide-react'
import AddToCartButton from '../components/product/add-to-cart-button'

type DeliItem = {
  id: string
  name: string
  slug?: string
  description?: string
  images?: any[] | any
  category: 'sandwiches' | 'wraps' | 'salads' | 'cold-cuts' | 'cheese' | 'sides' | 'other'
  soldByWeight?: boolean
  price?: number
  pricePerLb?: number
  allowedWeights?: string[]
  visible?: boolean
}

const CAT_LABEL: Record<DeliItem['category'], string> = {
  sandwiches: 'Sandwiches',
  wraps: 'Wraps',
  salads: 'Salads',
  'cold-cuts': 'Cold Cuts',
  cheese: 'Cheese',
  sides: 'Sides',
  other: 'Other',
}

const ALL_CATS: DeliItem['category'][] = ['sandwiches', 'wraps', 'salads', 'cold-cuts', 'cheese', 'sides', 'other']

export default function DeliPage() {
  const [items, setItems] = useState<DeliItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cat, setCat] = useState<'all' | DeliItem['category']>('all')
  const [weights, setWeights] = useState<Record<string, string>>({}) // itemId -> selected weight

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/deli?limit=300&depth=1&sort=category,sortOrder,name&where[visible][equals]=true')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (alive) setItems(data?.docs ?? [])
      } catch (e: any) {
        if (alive) setError(e?.message || 'Failed to load deli items')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => (cat === 'all' ? items : items.filter(i => i.category === cat)), [items, cat])

  const categoriesPresent = useMemo(() => {
    const set = new Set<DeliItem['category']>()
    for (const i of items) set.add(i.category)
    return Array.from(set)
  }, [items])

  function priceFor(item: DeliItem): string {
    if (item.soldByWeight) {
      const sel = weights[item.id] ?? item.allowedWeights?.[0] ?? '0.5'
      const lbs = parseFloat(sel)
      const unit = typeof item.pricePerLb === 'number' ? item.pricePerLb : 0
      const total = Math.max(0, lbs * unit)
      return `$${total.toFixed(2)} (${sel} lb @ $${unit.toFixed(2)}/lb)`
    } else if (typeof item.price === 'number') {
      return `$${item.price.toFixed(2)}`
    }
    return '$—'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Deli</h1>

          {/* Category filter */}
          <div className="relative">
            <select
              value={cat}
              onChange={e => setCat(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 px-4 py-2 pr-9 rounded-lg"
            >
              <option value="all">All</option>
              {ALL_CATS.filter(c => categoriesPresent.includes(c)).map(c => (
                <option key={c} value={c}>{CAT_LABEL[c]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>

        {loading && <div className="text-gray-500 dark:text-gray-400">Loading…</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(item => {
              const img = Array.isArray(item.images) ? item.images[0] : item.images
              const imgUrl = img?.url ?? null
              const isWeight = !!item.soldByWeight

              const opts = isWeight
                ? (item.allowedWeights?.length ? item.allowedWeights : ['0.25', '0.5', '1'])
                : []

              const selected = weights[item.id] ?? opts[0] ?? '0.5'

              // Build the object your AddToCartButton expects
              const productForCart: any = isWeight
                ? (() => {
                    const lbs = parseFloat(selected || '0')
                    const unit = typeof item.pricePerLb === 'number' ? item.pricePerLb : 0
                    const total = Math.max(0, unit * lbs)
                    return {
                      id: `${item.id}:${selected}`,           // unique per weight selection
                      name: `${item.name} (${lbs % 1 === 0 ? lbs.toFixed(0) : lbs.toFixed(2)} lb)`,
                      price: total,
                      images: item.images,
                      slug: item.slug ?? item.id,
                      metadata: {
                        source: 'deli',
                        soldByWeight: true,
                        weightLbs: lbs,
                        pricePerLb: unit,
                        baseId: item.id,
                        category: item.category,
                      },
                    }
                  })()
                : {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    images: item.images,
                    slug: item.slug ?? item.id,
                    metadata: { source: 'deli', category: item.category },
                  }

              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                  {/* Make the image clickable to the detail page */}
                  <Link href={`/deli/${item.slug ?? item.id}`} className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 block">
                    {imgUrl && (
                      <Image src={imgUrl} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
                    )}
                    {isWeight && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-900/80 text-white">
                        <Scale className="h-3.5 w-3.5" /> Priced by lb
                      </span>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link href={`/deli/${item.slug ?? item.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:underline">{item.name}</h3>
                    </Link>

                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{item.description}</p>
                    )}

                    {isWeight ? (
                      <>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Choose weight (¼ lb increments)</div>
                          <div className="flex flex-wrap gap-2">
                            {opts.map(val => {
                              const active = selected === val
                              const n = parseFloat(val)
                              const label = n % 1 === 0 ? `${n.toFixed(0)} lb` : `${n.toFixed(2)} lb`
                              return (
                                <button
                                  key={val}
                                  onClick={() => setWeights(w => ({ ...w, [item.id]: val }))}
                                  className={`px-2.5 py-1.5 rounded-full text-sm border ${
                                    active ? 'border-red-500 text-red-500' : 'border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{priceFor(item)}</div>
                          {/* ✅ Use your existing AddToCartButton */}
                          <AddToCartButton product={productForCart} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{priceFor(item)}</div>
                        {/* ✅ Use your existing AddToCartButton */}
                        <AddToCartButton product={productForCart} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
