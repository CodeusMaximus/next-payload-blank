'use client'

import { useMemo, useState } from 'react'
import AddToCartButton from '../../components/product/add-to-cart-button' // from /deli/[id]/ to /components/...
import { Scale } from 'lucide-react'

type Props = {
  doc: any
  imageUrl?: string | null
}

export default function DeliPurchase({ doc }: Props) {
  const isWeight = !!doc.soldByWeight

  const weights: string[] = useMemo(
    () =>
      Array.isArray(doc.allowedWeights) && doc.allowedWeights.length
        ? doc.allowedWeights
        : ['0.25', '0.5', '1'],
    [doc.allowedWeights]
  )

  const [selWeight, setSelWeight] = useState(weights[0])

  // Product object passed into your AddToCartButton
  const productForCart: any = useMemo(() => {
    if (isWeight) {
      const lbs = parseFloat(selWeight || '0')
      const unit = typeof doc.pricePerLb === 'number' ? doc.pricePerLb : 0
      const total = Math.max(0, unit * lbs)

      return {
        id: `${doc.id}:${selWeight}`, // unique per weight
        name: `${doc.name} (${lbs % 1 === 0 ? lbs.toFixed(0) : lbs.toFixed(2)} lb)`,
        price: total,
        images: doc.images,
        slug: doc.slug,
        metadata: {
          source: 'deli',
          soldByWeight: true,
          weightLbs: lbs,
          pricePerLb: unit,
          baseId: doc.id,
          category: doc.category,
        },
      }
    }

    // Non-weighted
    return {
      id: doc.id,
      name: doc.name,
      price: doc.price,
      images: doc.images,
      slug: doc.slug,
      metadata: {
        source: 'deli',
        category: doc.category,
      },
    }
  }, [isWeight, selWeight, doc])

  const displayPrice = useMemo(() => {
    if (!isWeight) return typeof doc.price === 'number' ? `$${doc.price.toFixed(2)}` : '$—'
    const lbs = parseFloat(selWeight || '0')
    const unit = typeof doc.pricePerLb === 'number' ? doc.pricePerLb : 0
    const total = Math.max(0, unit * lbs)
    return `$${total.toFixed(2)} (${lbs} lb @ $${unit.toFixed(2)}/lb)`
  }, [isWeight, selWeight, doc.price, doc.pricePerLb])

  return (
    <div className="space-y-4">
      {isWeight ? (
        <>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Choose weight (¼ lb increments)
            </div>
            <div className="flex flex-wrap gap-2">
              {weights.map((val) => {
                const active = selWeight === val
                const n = parseFloat(val)
                const label = n % 1 === 0 ? `${n.toFixed(0)} lb` : `${n.toFixed(2)} lb`
                return (
                  <button
                    key={val}
                    onClick={() => setSelWeight(val)}
                    className={`px-3 py-2 rounded-full text-sm border transition ${
                      active
                        ? 'border-red-500 text-red-500'
                        : 'border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-pressed={active}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {displayPrice}
            </div>
            {/* ✅ Your existing cart button */}
            <AddToCartButton product={productForCart} />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {displayPrice}
          </div>
          <AddToCartButton product={productForCart} />
        </div>
      )}
    </div>
  )
}
