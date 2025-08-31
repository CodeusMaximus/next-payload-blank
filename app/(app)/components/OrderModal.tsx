// components/OrderModal.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export type OrderDetails = {
  type: 'pickup' | 'delivery'
  name: string
  email: string
  phone: string
  address?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (details: OrderDetails) => void
}

export default function OrderModal({ isOpen, onClose, onSubmit }: Props) {
  const [type, setType] = useState<OrderDetails['type']>('pickup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const initialFocusRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => initialFocusRef.current?.focus(), 0)
  }, [isOpen])

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Basic validation
    if (!name.trim() || !email.trim() || !phone.trim()) return
    if (type === 'delivery' && !address.trim()) return

    const payload: OrderDetails = {
      type,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: type === 'delivery' ? address.trim() : undefined,
    }

    onSubmit?.(payload)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card */}
      <div className="relative z-[101] w-full max-w-lg rounded-2xl bg-gray-900 text-white shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Start your order</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-red-400"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Pickup / Delivery */}
          <fieldset className="grid grid-cols-2 gap-3" aria-label="Order type">
            <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition ${type==='pickup' ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-white/20'}`}>
              <input
                type="radio"
                name="type"
                value="pickup"
                checked={type==='pickup'}
                onChange={() => setType('pickup')}
                className="sr-only"
              />
              Pickup
            </label>
            <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition ${type==='delivery' ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-white/20'}`}>
              <input
                type="radio"
                name="type"
                value="delivery"
                checked={type==='delivery'}
                onChange={() => setType('delivery')}
                className="sr-only"
              />
              Delivery
            </label>
          </fieldset>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm text-gray-300" htmlFor="name">Full name</label>
              <input
                id="name"
                ref={initialFocusRef}
                type="text"
                required
                value={name}
                onChange={e=>setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e=>setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {type === 'delivery' && (
              <div>
                <label className="text-sm text-gray-300" htmlFor="address">Delivery address</label>
                <textarea
                  id="address"
                  required={type==='delivery'}
                  value={address}
                  onChange={e=>setAddress(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="123 Main St, Apt 4B, Staten Island, NY 10301"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 bg-red-500 hover:bg-red-600 font-medium shadow"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}