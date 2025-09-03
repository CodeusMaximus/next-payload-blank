 'use client'
// components/cart/cart-sidebar.tsx
import { useCart } from '../../../lib/cart/cart-context'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart()

  // Always compute total using linePrice (includes add-ons)
  const computedSubtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.linePrice ?? (i.salePrice ?? i.price)) * (i.quantity ?? 1), 0),
    [items]
  )
  const itemCount = items.reduce((n, i) => n + (i.quantity ?? 1), 0)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-md bg-white/10 dark:bg-black/20 z-40"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        onClick={closeCart}
      />

      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shopping Cart ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-full transition-all duration-200"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="p-6 rounded-2xl mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/10 dark:hover:bg-black/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                    }}
                  >
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                    {item.category && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {item.category.replace('-', ' ')}
                      </p>
                    )}

                    {/* Selected add-ons */}
                    {item.selectedAddOns && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(item.selectedAddOns).map(([group, addons]) =>
                          addons?.length ? (
                            <div key={group} className="text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-medium capitalize">{group.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                              {addons
                                .map((a) => `${a.name}${typeof a.price === 'number' && a.price > 0 ? ` (+$${a.price.toFixed(2)})` : ''}`)
                                .join(', ')}
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Prices */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(item.linePrice ?? (item.salePrice ?? item.price)).toFixed(2)}
                      </span>
                      {typeof item.addOnTotal === 'number' && item.addOnTotal > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          (incl. +${item.addOnTotal.toFixed(2)} add-ons)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Qty / Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 text-sm transition-colors"
                    >
                      Remove
                    </button>

                    <div
                      className="flex items-center gap-2 p-1 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                        className="p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
                        disabled={(item.quantity ?? 1) <= 1}
                      >
                        <Minus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>

                      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity ?? 1}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                        className="p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
                        disabled={item.stock ? (item.quantity ?? 1) >= item.stock : false}
                      >
                        <Plus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="p-6 space-y-4"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
              <span>Subtotal:</span>
              <span>${computedSubtotal.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9))',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={closeCart}
              className="w-full font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
