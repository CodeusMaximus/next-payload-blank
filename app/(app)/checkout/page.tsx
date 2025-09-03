 'use client'

// app/checkout/page.tsx (add-ons shown in summaries + sent to API)
import { useCart } from '../../lib/cart/cart-context'
import type { CartItem } from '../../lib/cart/cart-context'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import {
  ShoppingBag,
  CreditCard,
  Truck,
  MapPin,
  AlertCircle,
  CheckCircle2,
  User,
  Shield,
  ArrowRight,
} from 'lucide-react'

type PaymentMethod = 'credit_card' | 'snap_ebt' | 'cash' | 'both'

function formatMoney(n?: number) {
  if (typeof n !== 'number' || isNaN(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}

// prefer unit price that already includes add-ons if present
function unitPrice(i: CartItem) {
  if (typeof i.linePrice === 'number') return i.linePrice
  if (typeof i.basePrice === 'number') return i.basePrice
  if (typeof i.salePrice === 'number') return i.salePrice
  return i.price
}

// Accepts what your payload actually emits (nullable fields)
type AddOnEntry = {
  name?: string | null
  price?: number | null
  priceAdjustment?: number | null
  size?: string | null        // <-- allow null
  category?: string | null    // <-- allow null
  isDefault?: boolean | null
  // keep it future-proof
  [k: string]: unknown
}

function AddOnsList({
  selectedAddOns,
}: {
  selectedAddOns?:
    | Record<string, AddOnEntry[] | null | undefined>
    | null
    | undefined
}) {
  if (!selectedAddOns) return null

  const groups = Object.entries(selectedAddOns).filter(
    // keep only real arrays with at least one item
    ([, arr]) => Array.isArray(arr) && arr.length > 0
  ) as [string, AddOnEntry[]][]

  if (groups.length === 0) return null

  return (
    <div className="mt-1 space-y-0.5">
      {groups.map(([group, arr]) => (
        <div key={group} className="text-xs text-gray-600 dark:text-gray-300">
          <span className="font-medium capitalize">
            {group.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ')}:
          </span>{' '}
          {arr.map((a, i) => {
            const delta =
              typeof a?.price === 'number'
                ? a!.price!
                : typeof a?.priceAdjustment === 'number'
                ? a!.priceAdjustment!
                : 0
            const size = a?.size ?? undefined
            const name = a?.name ?? ''
            return (
              <span key={`${group}-${i}`} className="inline-block">
                {name}
                {size ? ` (${size})` : ''}
                {delta ? ` +$${delta.toFixed(2)}` : ''}
                {i < arr.length - 1 ? ', ' : ''}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice, itemCount, clearCart } = useCart()
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  })

  // Auto-fill with user data
  useState(() => {
    if (isSignedIn && user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: prev.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }))
    }
  })

  // SNAP groupings (use unit price that includes add-ons)
  const { snapEligibleItems, nonSnapItems, snapTotal, nonSnapTotal } = useMemo(() => {
    const snapEligible = items.filter((item) => item.snapEligible)
    const nonSnap = items.filter((item) => !item.snapEligible)
    const snapTotalCalc = snapEligible.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0)
    const nonSnapTotalCalc = nonSnap.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0)
    return {
      snapEligibleItems: snapEligible,
      nonSnapItems: nonSnap,
      snapTotal: snapTotalCalc,
      nonSnapTotal: nonSnapTotalCalc,
    }
  }, [items])

  // Redirect if empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h1>
        </div>
      </div>
    )
  }

  // Sign-in required screen
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to continue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to complete your order and access your order history
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sign In */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Secure Checkout
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sign in to save your information and track your orders
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Save your delivery addresses
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Track your order status in real-time
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">View your order history</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Faster checkout</span>
                </div>
              </div>

              <SignInButton mode="modal" fallbackRedirectUrl="/checkout" forceRedirectUrl="/checkout">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  Sign In to Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </div>

            {/* Cart Summary (pre-auth) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Order Summary ({itemCount} items)
              </h3>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const unit = unitPrice(item)
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="relative w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          {item.snapEligible && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">SNAP</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <AddOnsList selectedAddOns={item.selectedAddOns} />
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {formatMoney(unit * item.quantity)}
                        </p>
                        {typeof item.basePrice === 'number' && (
                          <p className="text-[11px] text-gray-500">
                            Base {formatMoney(item.basePrice)}
                            {typeof item.addOnTotal === 'number' && item.addOnTotal !== 0
                              ? ` • +${formatMoney(item.addOnTotal)}`
                              : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4">
                {snapTotal > 0 && (
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      SNAP Eligible:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMoney(snapTotal)}
                    </span>
                  </div>
                )}

                {nonSnapTotal > 0 && (
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Non-SNAP:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMoney(nonSnapTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">{formatMoney(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const orderData = {
        type: orderType,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address:
          orderType === 'delivery'
            ? `${customerInfo.street}${customerInfo.apartment ? ` ${customerInfo.apartment}` : ''}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`.trim()
            : undefined,
        notes: customerInfo.notes,
        paymentMethod,
        items: items.map((item) => {
          const unit = unitPrice(item)
          const base =
            typeof item.basePrice === 'number'
              ? item.basePrice
              : typeof item.salePrice === 'number'
              ? item.salePrice
              : item.price
          const addOnDelta = typeof item.addOnTotal === 'number' ? item.addOnTotal : Math.max(0, unit - base)
          return {
            lineId: item.id,                          // cart line id
            productId: item.productId ?? null,        // real product id if supplied on add-to-cart
            name: item.name,
            unitPrice: unit,                           // includes add-ons
            unitBasePrice: base,                       // before add-ons
            unitAddOnTotal: addOnDelta,                // add-ons per unit
            quantity: item.quantity,
            lineTotal: unit * item.quantity,
            selectedAddOns: item.selectedAddOns ?? {}, // exact selections
            category: item.category,
            snapEligible: !!item.snapEligible,
            image: item.image,
          }
        }),
        subtotal: totalPrice,
        snapTotal,
        nonSnapTotal,
        total: totalPrice,
        userId: user?.id,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error('Failed to create order')

      const { shortId } = await response.json()
      clearCart()
      router.push(`/order/${shortId}`)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof customerInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCustomerInfo(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Signed in as {user?.firstName || user?.primaryEmailAddress?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4">Order Summary ({itemCount} items)</h3>

            {/* SNAP note when applicable */}
            {paymentMethod === 'snap_ebt' && nonSnapTotal > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Mixed Cart Detected</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      {formatMoney(nonSnapTotal)} of your order is not SNAP eligible and will require another payment method.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 md:space-y-4 mb-6">
              {items.map((item) => {
                const unit = unitPrice(item)
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 40px, 48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        {item.snapEligible && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">SNAP</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <AddOnsList selectedAddOns={item.selectedAddOns} />
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-sm md:text-base">{formatMoney(unit * item.quantity)}</p>
                      {typeof item.basePrice === 'number' && (
                        <p className="text-[11px] text-gray-500">
                          Base {formatMoney(item.basePrice)}
                          {typeof item.addOnTotal === 'number' && item.addOnTotal !== 0
                            ? ` • +${formatMoney(item.addOnTotal)}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              {snapTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    SNAP Eligible Items:
                  </span>
                  <span className="font-medium">{formatMoney(snapTotal)}</span>
                </div>
              )}

              {nonSnapTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span>Non-SNAP Items:</span>
                  <span className="font-medium">{formatMoney(nonSnapTotal)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total:</span>
                <span>{formatMoney(totalPrice)}</span>
              </div>

              <p className="text-sm text-gray-500 mt-1">{orderType === 'pickup' ? 'Pickup' : 'Delivery'} • Free</p>
            </div>
          </div>

          {/* Order Form */}
          <div className="order-1 lg:order-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      paymentMethod === 'credit_card'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-xs text-gray-500">Pay at pickup/delivery</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('snap_ebt')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      paymentMethod === 'snap_ebt'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="h-5 w-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      S
                    </div>
                    <div className="text-left">
                      <div className="font-medium">SNAP/EBT</div>
                      <div className="text-xs text-gray-500">For eligible items</div>
                    </div>
                  </button>

                  {nonSnapTotal > 0 && snapTotal > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('both')}
                      className={`p-3 rounded-lg border-2 transition-colors flex items-center gap-3 sm:col-span-2 ${
                        paymentMethod === 'both'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex -space-x-1">
                        <div className="h-5 w-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                          S
                        </div>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">SNAP/EBT + Card</div>
                        <div className="text-xs text-gray-500">Split payment for mixed cart</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Type */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      orderType === 'pickup'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-500">Free</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      orderType === 'delivery'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Truck className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-500">Free</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={handleInputChange('name')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={handleInputChange('phone')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={handleInputChange('email')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.street}
                        onChange={handleInputChange('street')}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Apartment/Unit (Optional)</label>
                      <input
                        type="text"
                        value={customerInfo.apartment}
                        onChange={handleInputChange('apartment')}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                        placeholder="Apt 2B, Unit 15, Suite 100"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          required
                          value={customerInfo.city}
                          onChange={handleInputChange('city')}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <input
                          type="text"
                          required
                          value={customerInfo.state}
                          onChange={handleInputChange('state')}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                          placeholder="NY"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={customerInfo.zipCode}
                          onChange={handleInputChange('zipCode')}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                          placeholder="10001"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Special Instructions</h3>
                <textarea
                  value={customerInfo.notes}
                  onChange={handleInputChange('notes')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm md:text-base"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 md:py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CreditCard className="h-5 w-5" />
                {isLoading ? 'Processing...' : `Place Order - ${formatMoney(totalPrice)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
