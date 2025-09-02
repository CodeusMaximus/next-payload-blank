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
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <Link href={`/breakfastandlunch/${item.slug ?? item.id}`} className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 block">
                    {imgUrl && (
                      <Image 
                        src={imgUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover hover:scale-105 transition-transform duration-300" 
                        sizes="(max-width:768px) 100vw, 25vw" 
                      />
                    )}
                    {/* Sale Badge */}
                    {onSale && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        SALE
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    {/* Product Name */}
                    <Link href={`/breakfastandlunch/${item.slug ?? item.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Price - moved before description */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ${Number(displayPrice || 0).toFixed(2)}
                        </span>
                        {onSale && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {onSale && (
                        <div className="text-center">
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Save ${(item.price - displayPrice!).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 text-center">
                        {item.description}
                      </p>
                    )}

                    {/* Centered Add to Cart Button */}
                    <div className="flex justify-center">
                      <AddToCartButton 
                        product={productForCart} 
                        className="px-6 py-2 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No breakfast/lunch items available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}