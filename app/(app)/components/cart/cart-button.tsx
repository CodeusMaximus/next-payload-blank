'use client'
// components/cart/cart-button.tsx
import { useCart } from '../../../lib/cart/cart-context'
import { ShoppingCart } from 'lucide-react'

export default function CartButton() {
  const { itemCount, toggleCart } = useCart()

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}