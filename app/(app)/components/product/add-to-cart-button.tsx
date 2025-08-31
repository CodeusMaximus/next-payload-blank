'use client'
// components/product/add-to-cart-button.tsx (updated with SNAP support)
import { useCart } from '../../../lib/cart/cart-context'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'

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

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Get the main image
    const mainImage = Array.isArray(product.images) ? product.images[0] : product.images
    const imageUrl = typeof mainImage === 'object' && mainImage?.url ? mainImage.url : undefined

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      stock: product.stock,
      snapEligible: product.snapEligible,
      image: imageUrl
    })

    // Brief loading state for better UX
    setTimeout(() => {
      setIsAdding(false)
    }, 300)
  }

  const isOutOfStock = product.stock === 0

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdding}
      className={`
        ${className}
        ${isOutOfStock 
          ? 'bg-gray-400 cursor-not-allowed' 
          : isAdding
          ? 'bg-green-600'
          : 'bg-blue-600 hover:bg-blue-700'
        }
        text-white font-semibold py-4 px-6 rounded-xl transition-colors 
        flex items-center justify-center gap-2 w-full
      `}
    >
      <ShoppingCart className="h-5 w-5" />
      {isOutOfStock 
        ? 'Out of Stock' 
        : isAdding 
        ? 'Added to Cart!' 
        : 'Add to Cart'
      }
    </button>
  )
}