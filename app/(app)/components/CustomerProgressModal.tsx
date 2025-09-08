'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { getPusherClient } from '../..//lib/pusher/client' // <-- adjust path if needed

// ----- Types (match your dashboard) -----
type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'canceled'

type OrderType = 'pickup' | 'delivery'
type OrderItemAddOn = { group: string; name: string; delta?: number }
type OrderItem = { name: string; quantity: number; unit: number; addOns?: OrderItemAddOn[] }

type Order = {
  id: string
  shortId: string
  name: string
  email?: string
  phone?: string
  address?: string
  type: OrderType
  status: OrderStatus
  createdAt?: string
  items: OrderItem[]
  total: number
  demo?: boolean
}

// ----- Labels & ordering -----
const LABEL: Record<OrderStatus, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  canceled: 'Canceled',
}
const STATUS_ORDER: OrderStatus[] = [
  'received',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
]
const statusIndex = (s: OrderStatus) =>
  Math.max(0, STATUS_ORDER.indexOf(s === 'canceled' ? 'received' : s))

// ----- Small helpers -----
const tTime = (d?: string) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '')
const tDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')

function StepsBar({ current }: { current: OrderStatus }) {
  const idx = statusIndex(current)
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        {STATUS_ORDER.map((s, i) => {
          const active = i <= idx
          return (
            <div key={s} className="flex-1 h-2 rounded-full" aria-label={LABEL[s]}
              style={{ background: active ? 'linear-gradient(90deg,#3b82f6,#10b981)' : '#e5e7eb' }} />
          )
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        {STATUS_ORDER.map(s => (<span key={s} className="capitalize">{LABEL[s]}</span>))}
      </div>
    </div>
  )
}

function ModalFrame({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/20 p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function CustomerProgressModal({
  shortId,
  open,
  onClose,
  initialOrder,            // optional: pass initial data if you have it
  trackUrl,                // optional: share link to this modal/page
}: {
  shortId: string
  open: boolean
  onClose: () => void
  initialOrder?: Partial<Order>
  trackUrl?: string
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch initial order if API is available
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        if (initialOrder?.shortId) {
          // If you passed initial data, prefer it
          setOrder(prev => ({ ...(prev as any), ...initialOrder } as Order))
        } else {
          // Try GET /api/orders/[shortId] if you have it
          const res = await fetch(`/api/orders/${shortId}`).catch(() => null)
          if (res && res.ok) {
            const o = await res.json()
            if (!cancelled) setOrder(o)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (open) load()
    return () => { cancelled = true }
  }, [shortId, open, initialOrder])

  // Realtime updates from your dashboard via Pusher
  useEffect(() => {
    if (!open) return
    const client = getPusherClient()
    const ch = client.subscribe('orders')

    // If your backend can publish per-order channels, also:
    // const per = client.subscribe(`order:${shortId}`)

    const onUpdate = (o: any) => {
      if (o?.shortId === shortId) {
        setOrder(prev => ({ ...(prev || {} as any), ...o }))
      }
    }

    ch.bind('order:update', onUpdate)
    ch.bind('order:new', onUpdate)
    // per.bind('order:update', onUpdate)

    return () => {
      ch.unbind('order:update', onUpdate)
      ch.unbind('order:new', onUpdate)
      // per.unbind('order:update', onUpdate)
      client.unsubscribe('orders')
      // client.unsubscribe(`order:${shortId}`)
    }
  }, [open, shortId])

  const title = order ? `Order ${order.shortId}` : `Order ${shortId}`

  return (
    <ModalFrame open={open} onClose={onClose} title={title}>
      {loading && !order && (
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading status…
        </div>
      )}

      {order && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-semibold text-slate-800">{order.name || 'Customer'}</div>
              <div className="text-xs text-slate-500">{order.type === 'delivery' ? 'Delivery' : 'Pickup'}</div>
            </div>
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 capitalize">
              {LABEL[order.status]}
            </span>
          </div>

          <StepsBar current={order.status} />

          <div className="text-xs text-slate-500">
            Placed {tTime(order.createdAt)} • {tDate(order.createdAt)}
          </div>

          {trackUrl && (
            <div className="pt-2">
              <label className="block text-xs text-slate-500 mb-1">Share this link</label>
              <div className="flex gap-2">
                <input className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50" readOnly value={trackUrl} onFocus={e => e.currentTarget.select()} />
                <button
                  className="px-3 py-2 text-sm bg-slate-800 text-white rounded-lg hover:opacity-90"
                  onClick={async () => { try { await navigator.clipboard.writeText(trackUrl) } catch {} }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200">Close</button>
          </div>
        </div>
      )}
    </ModalFrame>
  )
}
