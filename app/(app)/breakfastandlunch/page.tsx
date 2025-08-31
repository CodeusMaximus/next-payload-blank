 'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '../components/product/add-to-cart-button'

type BLItem = {
  id: string
  name: string
  slug?: string
  description?: string
  images?: any[] | any
  section?: string
  subcategory?: string
  price: number
  onSale?: boolean
  salePrice?: number
  visible?: boolean
}

export default function BreakfastAndLunchPage() {
  const [items, setItems] = useState<BLItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        // adjust your API route/collection if needed
        const res = await fetch('/api/breakfast-dinner?limit=300&depth=1&sort=section,subcategory,name&where[visible][equals]=true')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (alive) setItems(data?.docs ?? [])
      } catch (e: any) {
        if (alive) setError(e?.message || 'Failed to load items')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const list = useMemo(() => items, [items])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Breakfast / Lunch</h1>

        {loading && <div className="text-gray-500 dark:text-gray-400">Loading…</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map(item => {
              const img = Array.isArray(item.images) ? item.images[0] : item.images
              const imgUrl = img?.url ?? null
              const onSale = !!item.onSale && typeof item.salePrice === 'number'
              const displayPrice = onSale ? item.salePrice : item.price
              const productForCart: any = {
                id: item.id,
                name: item.name,
                price: displayPrice,
                images: item.images,
                slug: item.slug ?? item.id,
                metadata: {
                  source: 'breakfast-lunch',
                  section: item.section,
                  subcategory: item.subcategory,
                  originalPrice: onSale ? item.price : undefined,
                },
              }

              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                  <Link href={`/breakfastandlunch/${item.slug ?? item.id}`} className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 block">
                    {imgUrl && (
                      <Image src={imgUrl} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
                    )}
                  </Link>

                  <div className="p-4">
                    <Link href={`/breakfastandlunch/${item.slug ?? item.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:underline">{item.name}</h3>
                    </Link>

                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{item.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${Number(displayPrice || 0).toFixed(2)}
                        {onSale && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* ✅ Your existing AddToCartButton */}
                      <AddToCartButton product={productForCart} />
                    </div>
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
