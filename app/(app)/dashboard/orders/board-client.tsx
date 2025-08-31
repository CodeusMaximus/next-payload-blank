// app/admin/orders/board-client.tsx (enhanced version)
'use client'
import { useEffect, useMemo, useState } from 'react'
import { getPusherClient } from '../../../lib/pusher/client'

type Order = {
  id: string
  shortId: string
  name: string
  email?: string
  phone?: string
  address?: string
  type: 'pickup' | 'delivery'
  status: 'received' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'canceled'
  createdAt?: string
  // Add these if you want to track order items
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
  total?: number
}

const LABEL: Record<Order['status'], string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  canceled: 'Canceled',
}
const STATUSES: Order['status'][] = ['received','confirmed','preparing','ready','out_for_delivery','completed','canceled']

function formatTime(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export default function OrdersBoardClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const client = getPusherClient()
    const channelName = 'orders'
    const ch = client.subscribe(channelName)

    const onNew = (o: Partial<Order>) => {
      setOrders(prev => (prev.some(p => p.shortId === o.shortId) ? prev : [{ ...(o as Order) }, ...prev]))
    }
    const onUpdate = (o: Partial<Order>) => {
      setOrders(prev => prev.map(p => (p.shortId === o.shortId ? { ...p, ...o } as Order : p)))
    }

    ch.bind('order:new', onNew)
    ch.bind('order:update', onUpdate)

    return () => {
      ch.unbind('order:new', onNew)
      ch.unbind('order:update', onUpdate)
      client.unsubscribe(channelName)
    }
  }, [])

  const grouped = useMemo(() => {
    const g: Record<string, Order[]> = {}
    for (const s of STATUSES) g[s] = []
    for (const o of orders) g[o.status]?.push(o)
    return g
  }, [orders])

  async function setStatus(shortId: string, status: Order['status']) {
    await fetch(`/api/orders/${shortId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {STATUSES.map(s => (
        <div key={s} className="bg-gray-900/60 rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{LABEL[s]}</h2>
            <span className="text-xs text-gray-400">{grouped[s].length}</span>
          </div>
          <div className="space-y-3">
            {grouped[s].map(o => (
              <div key={o.shortId} className="rounded-lg border border-white/10 p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-300">#{o.shortId}</div>
                    <div className="text-white font-medium">{o.name}</div>
                  </div>
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === o.shortId ? null : o.shortId)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {expandedOrder === o.shortId ? '−' : '+'}
                  </button>
                </div>

                {/* Basic info */}
                <div className="text-xs text-gray-400 mb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="uppercase font-medium">{o.type}</span>
                    {o.createdAt && (
                      <span>{formatTime(o.createdAt)} • {formatDate(o.createdAt)}</span>
                    )}
                  </div>
                  {o.total && (
                    <div className="text-green-400 font-medium">${o.total.toFixed(2)}</div>
                  )}
                </div>

                {/* Expanded details */}
                {expandedOrder === o.shortId && (
                  <div className="mb-3 text-xs space-y-2 border-t border-white/10 pt-2">
                    {o.email && (
                      <div className="text-gray-300">
                        <span className="text-gray-400">Email:</span> {o.email}
                      </div>
                    )}
                    {o.phone && (
                      <div className="text-gray-300">
                        <span className="text-gray-400">Phone:</span> {o.phone}
                      </div>
                    )}
                    {o.address && o.type === 'delivery' && (
                      <div className="text-gray-300">
                        <span className="text-gray-400">Address:</span> {o.address}
                      </div>
                    )}
                    {o.items && o.items.length > 0 && (
                      <div className="text-gray-300">
                        <div className="text-gray-400 mb-1">Items:</div>
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter(t => t !== s).slice(0, 4).map(t => (
                    <button
                      key={t}
                      onClick={() => setStatus(o.shortId, t)}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15"
                    >
                      {LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {grouped[s].length === 0 && (
              <div className="text-xs text-gray-500">No orders</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}