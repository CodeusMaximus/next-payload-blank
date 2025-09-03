'use client'
// lib/cart/cart-context.tsx
import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'

/** One add-on choice */
export type AddOn = {
  id?: string | null
  name: string
  price?: number
  size?: string | null
  category?: string | null
  isDefault?: boolean
  isSpicy?: boolean
}

/** Cart line item (a specific product with a specific set of add-ons) */
export interface CartItem {
  /** Line id (unique per row in the cart, NOT the product id) */
  id: string

  /** Product identity & basics */
  productId?: string
  name: string
  image?: string
  category?: string
  stock?: number
  snapEligible?: boolean

  /** Pricing */
  price: number            // base/original price for reference
  salePrice?: number       // optional sale price for reference
  basePrice?: number       // unit price before add-ons (defaults to salePrice ?? price)
  addOnTotal?: number      // unit add-on total
  linePrice?: number       // unit total used for totals (basePrice + addOnTotal)

  /** Quantity */
  quantity: number

  /** Selections */
  selectedAddOns?: Record<string, AddOn[]>
  addOnSummary?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number } }
  | { type: 'REMOVE_ITEM'; id: string }                // id is the LINE id
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

/** stable stringify to compare add-on selections reliably */
function stableStringify(obj: any): string {
  const seen = new WeakSet()
  const sorter = (v: any): any => {
    if (v && typeof v === 'object') {
      if (seen.has(v)) return v
      seen.add(v)
      if (Array.isArray(v)) return v.map(sorter)
      return Object.keys(v)
        .sort()
        .reduce((acc: any, k) => {
          acc[k] = sorter(v[k])
          return acc
        }, {})
    }
    return v
  }
  return JSON.stringify(sorter(obj))
}

/** generate a unique line id */
function genLineId(seed: string) {
  return `${seed}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

/** Merge key: product + exact same selections */
function buildMergeKey(item: { productId?: string; selectedAddOns?: Record<string, AddOn[]> }) {
  const pid = item.productId ?? 'no-product'
  const sel = stableStringify(item.selectedAddOns ?? {})
  return `${pid}__${sel}`
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const qty = action.item.quantity ?? 1

      // normalize pricing
      const base = typeof action.item.basePrice === 'number'
        ? action.item.basePrice
        : (typeof action.item.salePrice === 'number' ? action.item.salePrice : action.item.price)

      const addOnTotal = typeof action.item.addOnTotal === 'number' ? action.item.addOnTotal : 0
      const linePrice = typeof action.item.linePrice === 'number' ? action.item.linePrice : (base + addOnTotal)

      const normalized: Omit<CartItem, 'id' | 'quantity'> & { id: string; quantity: number } = {
        ...action.item,
        id: action.item.id || genLineId(action.item.productId || 'line'),
        basePrice: base,
        addOnTotal,
        linePrice,
        quantity: qty,
      }

      // try to merge with an existing line that has same product + same selections
      const incomingKey = buildMergeKey(normalized)
      const idx = state.items.findIndex(i => buildMergeKey(i) === incomingKey)

      if (idx >= 0) {
        const existing = state.items[idx]
        const max = existing.stock || 999
        const mergedQty = Math.min(existing.quantity + qty, max)

        const merged: CartItem = {
          ...existing,
          // keep pricing from existing line (they should be identical anyway)
          quantity: mergedQty,
        }

        const next = [...state.items]
        next[idx] = merged
        return { ...state, items: next, isOpen: true }
      }

      // otherwise push as a new line
      return {
        ...state,
        items: [...state.items, normalized as CartItem],
        isOpen: true,
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id),
      }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.id),
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.id
            ? { ...item, quantity: Math.min(action.quantity, item.stock || 999) }
            : item
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    case 'LOAD_CART':
      return { ...state, items: action.items }

    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  snapEligibleTotal: number
  nonSnapTotal: number
  snapEligibleCount: number
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) dispatch({ type: 'LOAD_CART', items: JSON.parse(saved) })
    } catch (e) {
      console.error('Error loading cart from localStorage:', e)
    }
  }, [])

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items))
    } catch (e) {
      console.error('Error saving cart to localStorage:', e)
    }
  }, [state.items])

  const addItem: CartContextValue['addItem'] = (item) => {
    // If caller didn’t supply a line id, generate one here.
    const withId = { ...item, id: item.id || genLineId(item.productId || 'line') }
    dispatch({ type: 'ADD_ITEM', item: withId })
  }

  const removeItem: CartContextValue['removeItem'] = (id) =>
    dispatch({ type: 'REMOVE_ITEM', id })

  const updateQuantity: CartContextValue['updateQuantity'] = (id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity })

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })
  const closeCart = () => dispatch({ type: 'CLOSE_CART' })

  const itemCount = state.items.reduce((n, i) => n + i.quantity, 0)

  // Totals prefer linePrice (includes add-ons), then sale/base price
  const totalPrice = state.items.reduce((sum, i) => {
    const unit =
      typeof i.linePrice === 'number'
        ? i.linePrice
        : (typeof i.basePrice === 'number'
            ? i.basePrice
            : (typeof i.salePrice === 'number' ? i.salePrice : i.price))
    return sum + unit * i.quantity
  }, 0)

  // SNAP breakdowns (simple: use unit pricing same as above; if you need
  // per-add-on SNAP eligibility, you’d track that per add-on)
  const snapEligibleTotal = state.items
    .filter(i => i.snapEligible)
    .reduce((sum, i) => {
      const unit =
        typeof i.linePrice === 'number'
          ? i.linePrice
          : (typeof i.basePrice === 'number'
              ? i.basePrice
              : (typeof i.salePrice === 'number' ? i.salePrice : i.price))
      return sum + unit * i.quantity
    }, 0)

  const nonSnapTotal = state.items
    .filter(i => !i.snapEligible)
    .reduce((sum, i) => {
      const unit =
        typeof i.linePrice === 'number'
          ? i.linePrice
          : (typeof i.basePrice === 'number'
              ? i.basePrice
              : (typeof i.salePrice === 'number' ? i.salePrice : i.price))
      return sum + unit * i.quantity
    }, 0)

  const snapEligibleCount = state.items
    .filter(i => i.snapEligible)
    .reduce((n, i) => n + i.quantity, 0)

  const value: CartContextValue = {
    items: state.items,
    itemCount,
    totalPrice,
    snapEligibleTotal,
    nonSnapTotal,
    snapEligibleCount,
    isOpen: state.isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
