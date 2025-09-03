 'use client'
// components/product/add-to-cart-button.tsx
import { useCart } from '../../../lib/cart/cart-context'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'

type AddOn = {
  id: string | null
  name: string
  price?: number
  size?: string | null
  category?: string | null
  isDefault?: boolean
  isSpicy?: boolean
  _priceKey?: 'price' | 'priceAdjustment'
}

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number
  stock?: number
  category?: string
  snapEligible?: boolean
  images?: Array<{ url?: string; alt?: string }>
}

interface AddToCartButtonProps {
  product: Product
  className?: string
}

const GROUPS = [
  'proteins',
  'cheeses',
  'sauces',
  'vegetables',
  'breadOptions',
  'sides',
  'cookingOptions',
  'beverages',
  'portionSizes',      // uses priceAdjustment but we already serialize that
  'dietaryOptions',
] as const

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)

    // 1) Read selected checkboxes from the product page form
    const form = document.getElementById('customize-form') as HTMLFormElement | null
    const formData = form ? new FormData(form) : null

    // 2) Gather per-group selections (values are JSON strings from the checkbox value)
    const selectedByGroup: Record<string, AddOn[]> = {}
    let addOnTotal = 0

    if (formData) {
      for (const group of GROUPS) {
        const raw = formData.getAll(`${group}[]`) as string[]
        if (!raw.length) continue

        const parsed = raw
          .map((s) => {
            try {
              return JSON.parse(s) as AddOn
            } catch {
              return null
            }
          })
          .filter(Boolean) as AddOn[]

        selectedByGroup[group] = parsed

        // sum each add-on's "price" (portionSizes also uses "price" because we serialized priceAdjustment as price)
        for (const a of parsed) {
          if (typeof a.price === 'number') addOnTotal += a.price
        }
      }
    }

    // 3) Build a stable human summary (optional)
    const flatSummary: string[] = []
    Object.entries(selectedByGroup).forEach(([group, items]) => {
      if (!items?.length) return
      const names = items.map((i) => i.name).join(', ')
      flatSummary.push(`${group}: ${names}`)
    })

    // 4) Compute effective price
    const baseUnit = typeof product.salePrice === 'number' ? product.salePrice : product.price
    const effectiveUnit = baseUnit + addOnTotal

    // 5) Safe main image
    const mainImage = Array.isArray(product.images) ? product.images[0] : product.images
    const imageUrl =
      mainImage && typeof mainImage === 'object' && mainImage.url ? mainImage.url : undefined

    // 6) Use a unique id for the line so two differently customized items don’t overwrite each other
    const lineId = `${product.id}-${Math.random().toString(36).slice(2, 8)}`

    // 7) Add to cart with selected add-ons and the effective price
    addItem({
      id: lineId,               // unique line id (keep productId separately if your cart uses it)
      productId: product.id,    // original product id
      name: product.name,
      image: imageUrl,
      category: product.category,
      stock: product.stock,
      snapEligible: product.snapEligible,

      // pricing
      price: product.price,               // keep original base price for reference
      salePrice: product.salePrice,       // keep original sale price for reference
      basePrice: baseUnit,                // base price actually used before add-ons
      addOnTotal,                         // sum of add-ons per unit
      linePrice: effectiveUnit,           // price per unit INCLUDING add-ons (UI prefers this)
      quantity: 1,

      // selections for UI
      selectedAddOns: selectedByGroup,    // { proteins:[...], sauces:[...], ... }
      addOnSummary: flatSummary.join(' • '),
    })

    setTimeout(() => setIsAdding(false), 300)
  }

  const isOutOfStock = product.stock === 0

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdding}
      className={`
        ${className}
        ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : isAdding ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
        text-white font-semibold py-4 px-6 rounded-xl transition-colors 
        flex items-center justify-center gap-2 w-full
      `}
    >
      <ShoppingCart className="h-5 w-5" />
      {isOutOfStock ? 'Out of Stock' : isAdding ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  )
}
