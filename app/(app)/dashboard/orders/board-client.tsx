'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPusherClient } from '../../../lib/pusher/client'

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

const LABEL: Record<OrderStatus, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  canceled: 'Canceled',
}
const STATUSES: OrderStatus[] = ['received','confirmed','preparing','ready','out_for_delivery','completed','canceled']

const money = (n: number) => `$${n.toFixed(2)}`
const tTime = (d?: string) => (d ? new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '')
const tDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '')

// ---------- Demo data

function lineTotal(it: OrderItem) {
  const add = (it.addOns || []).reduce((s,a)=> s + (a.delta || 0), 0)
  return (it.unit + add) * it.quantity
}
function orderTotal(items: OrderItem[]) {
  return items.reduce((s,it)=> s + lineTotal(it), 0)
}
function id8() { return Math.random().toString(36).slice(2,10).toUpperCase() }

function seedDemo(): Order[] {
  const now = Date.now()
  const iso = (minsAgo: number) => new Date(now - minsAgo*60*1000).toISOString()

  const o = (partial: Partial<Order>): Order => {
    const items = partial.items || []
    const total = orderTotal(items as OrderItem[])
    return {
      id: crypto.randomUUID(),
      shortId: partial.shortId || id8(),
      name: partial.name || 'Customer',
      email: partial.email,
      phone: partial.phone,
      address: partial.address,
      type: (partial.type as OrderType) || 'pickup',
      status: (partial.status as OrderStatus) || 'received',
      createdAt: partial.createdAt || new Date().toISOString(),
      items: items as OrderItem[],
      total: total > 0 ? total : 1,
      demo: true,
    }
  }

  return [
    o({
      shortId: 'ALP-3512',
      name: 'John Carter',
      phone: '(917) 555-1122',
      type: 'pickup',
      status: 'received',
      createdAt: iso(4),
      items: [
        { name: "Boar's Head Turkey Sandwich", quantity: 1, unit: 9.99, addOns: [
          { group:'Bread', name:'Sourdough' },
          { group:'Cheese', name:'Swiss', delta: 0.75 },
          { group:'Veg', name:'Lettuce' },
          { group:'Veg', name:'Tomato' },
          { group:'Sauce', name:'Mayo' },
        ]},
        { name: 'Gala Apples (1 lb)', quantity: 2, unit: 2.49 },
        { name: 'Organic Milk (1 gal)', quantity: 1, unit: 5.79 },
      ],
    }),
    o({
      shortId: 'ALP-9021',
      name: 'Maria Alvarez',
      phone: '(347) 555-9010',
      type: 'delivery',
      address: '77 Victory Blvd, Staten Island, NY 10301',
      status: 'confirmed',
      createdAt: iso(12),
      items: [
        { name: 'Chicken Caesar Wrap', quantity: 2, unit: 8.49, addOns: [
          { group:'Cheese', name:'Parmesan' },
          { group:'Sauce', name:'Caesar' },
        ]},
        { name: 'Bananas (per lb)', quantity: 3, unit: 0.79 },
        { name: 'Bottled Water (24-pack)', quantity: 1, unit: 4.99 },
      ],
    }),
    o({
      shortId: 'ALP-4777',
      name: 'Ethan Park',
      phone: '(646) 555-4433',
      type: 'pickup',
      status: 'preparing',
      createdAt: iso(23),
      items: [
        { name: 'Custom Omelette (3 eggs)', quantity: 1, unit: 7.99, addOns: [
          { group:'Cheese', name:'Cheddar', delta: 0.75 },
          { group:'Protein', name:'Turkey Bacon', delta: 1.50 },
          { group:'Veg', name:'Onion' },
          { group:'Veg', name:'Spinach' },
        ]},
        { name: 'Orange Juice (12oz)', quantity: 1, unit: 2.99 },
      ],
    }),
    o({
      shortId: 'ALP-1288',
      name: 'Priya Patel',
      phone: '(917) 555-7788',
      type: 'delivery',
      address: '155 Bay St, Staten Island, NY 10301',
      status: 'ready',
      createdAt: iso(37),
      items: [
        { name: 'Ground Coffee (12oz)', quantity: 1, unit: 8.99 },
        { name: 'Greek Yogurt (4-pack)', quantity: 1, unit: 4.49 },
        { name: 'Italian Hero', quantity: 1, unit: 10.49, addOns: [
          { group:'Cheese', name:'Provolone' },
          { group:'Veg', name:'Lettuce' },
          { group:'Veg', name:'Tomato' },
          { group:'Sauce', name:'Oil & Vinegar' },
          { group:'Spice', name:'Oregano' },
        ]},
      ],
    }),
    o({
      shortId: 'ALP-6604',
      name: 'Sofia Rossi',
      phone: '(917) 555-0033',
      type: 'pickup',
      status: 'received',
      createdAt: iso(2),
      items: [
        { name: 'Avocado Toast', quantity: 1, unit: 7.50 },
        { name: 'Fresh Strawberries (1 lb)', quantity: 1, unit: 3.99 },
        { name: 'Latte (16oz)', quantity: 1, unit: 4.25 },
      ],
    }),
    o({
      shortId: 'ALP-7340',
      name: 'Liam Murphy',
      phone: '(718) 555-7781',
      type: 'delivery',
      address: '220 Bay St, Staten Island, NY 10301',
      status: 'out_for_delivery',
      createdAt: iso(52),
      items: [
        { name: 'Whole Wheat Bread (loaf)', quantity: 1, unit: 3.49 },
        { name: 'Eggs (dozen)', quantity: 1, unit: 3.29 },
        { name: 'Turkey Club', quantity: 1, unit: 9.49, addOns: [
          { group:'Toast', name:'Yes' },
          { group:'Cheese', name:'American' },
          { group:'Sauce', name:'Honey Mustard' },
        ]},
      ],
    }),
  ]
}

// ---------- Component

export default function OrdersBoardClient({
  initialOrders = [],
  demoOnly = true,             // <<< DEMO MODE: no API calls; buttons always work
  startExpanded = true,        // expand cards so you can see items immediately
}: {
  initialOrders?: Order[]
  demoOnly?: boolean
  startExpanded?: boolean
}) {
  // Use real orders if provided, else seed demo
  const seeded = (initialOrders.length ? initialOrders : seedDemo()).map(o => ({
    ...o,
    total: typeof o.total === 'number' && o.total > 0 ? o.total : orderTotal(o.items),
  }))

  const [orders, setOrders] = useState<Order[]>(seeded)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(seeded.map(o => [o.shortId, startExpanded]))
  )
  const [active, setActive] = useState<'all' | OrderStatus>('all')
  const [isLight, setIsLight] = useState(true)
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  // Realtime only when not demo
  useEffect(() => {
    if (demoOnly) return
    const client = getPusherClient()
    const ch = client.subscribe('orders')
    const onNew = (o: any) => setOrders(prev => prev.some(p => p.shortId === o.shortId) ? prev : [{...o, demo:false}, ...prev])
    const onUpdate = (o: any) => setOrders(prev => prev.map(p => p.shortId === o.shortId ? {...p, ...o, demo:false} : p))
    ch.bind('order:new', onNew)
    ch.bind('order:update', onUpdate)
    return () => { ch.unbind('order:new', onNew); ch.unbind('order:update', onUpdate); client.unsubscribe('orders') }
  }, [demoOnly])

  const counts = useMemo(() => {
    const c: Record<'all'|OrderStatus, number> = { all: orders.length, received:0, confirmed:0, preparing:0, ready:0, out_for_delivery:0, completed:0, canceled:0 }
    for (const o of orders) c[o.status]++
    return c
  }, [orders])

  const grouped = useMemo(() => {
    const g: Record<OrderStatus, Order[]> = { received:[], confirmed:[], preparing:[], ready:[], out_for_delivery:[], completed:[], canceled:[] }
    for (const o of orders) g[o.status].push(o)
    return g
  }, [orders])

  async function changeStatus(shortId: string, next: OrderStatus) {
    // optimistic UI
    setBusy(b => ({ ...b, [shortId]: true }))
    const prev = orders
    setOrders(list => list.map(o => o.shortId === shortId ? { ...o, status: next } : o))

    try {
      if (!demoOnly) {
        await fetch(`/api/orders/${shortId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        }).then(r => { if (!r.ok) throw new Error('bad status') })
      }
    } catch {
      // rollback if API mode fails
      if (!demoOnly) setOrders(prev)
    } finally {
      setBusy(b => ({ ...b, [shortId]: false }))
    }
  }

  // theme tokens
  const textMain = isLight ? 'text-gray-900' : 'text-white'
  const textSub  = isLight ? 'text-gray-600' : 'text-white/70'
  const textDim  = isLight ? 'text-gray-500' : 'text-white/60'
  const border   = isLight ? 'border-gray-200' : 'border-white/10'
  const panel    = isLight ? 'bg-white' : 'bg-white/5'
  const panel2   = isLight ? 'bg-gray-50' : 'bg-white/[0.04]'
  const mutedBtn = isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/15'

  const visible = active === 'all' ? STATUSES : [active]

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-20 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold tracking-wide ${textMain} uppercase`}>Statuses</h2>
            <button
              type="button"
              onClick={() => setIsLight(v => !v)}
              className={`text-xs px-2 py-1 rounded border ${border} ${mutedBtn} ${textMain}`}
              title="Toggle theme"
            >
              {isLight ? 'Dark' : 'Light'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActive('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${border} ${textMain} text-sm font-semibold
              ${active === 'all' ? 'bg-black text-white border-black' : panel2}`}
          >
            <span>All Orders</span>
            <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-black text-white">{counts.all}</span>
          </button>

          {STATUSES.map(s => (
            <button
              type="button"
              key={s}
              onClick={() => setActive(s)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${border} ${textMain} text-sm font-semibold capitalize
                ${active === s ? 'bg-black text-white border-black' : panel2}`}
            >
              <span>{LABEL[s]}</span>
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-black text-white">{counts[s]}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className={`text-xl md:text-2xl font-bold ${textMain}`}>{active === 'all' ? 'All Orders' : LABEL[active]}</h1>
          <div className={`text-xs ${textDim}`}>Click status buttons to move an order</div>
        </div>

        <div className={`grid gap-4 ${active === 'all' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'}`}>
          {visible.map(status => (
            <div key={status} className={`${panel} rounded-xl border ${border} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-black text-white">
                  {LABEL[status]}
                </span>
                <span className={`text-xs ${textDim}`}>{grouped[status].length}</span>
              </div>

              <div className="space-y-3">
                {grouped[status].map(o => {
                  const isOpen = !!expanded[o.shortId]
                  return (
                    <div key={o.shortId} className={`${panel2} rounded-lg border ${border} p-3`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`text-xs ${textSub}`}>#{o.shortId}</div>
                          <div className={`font-semibold ${textMain}`}>{o.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${o.type === 'pickup' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                              {o.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
                            </span>
                            {o.createdAt && (
                              <span className={`text-[11px] ${textDim}`}>{tTime(o.createdAt)} • {tDate(o.createdAt)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {/* BIG green total with different values per order */}
                          <div className="text-emerald-600 font-extrabold text-2xl md:text-3xl leading-none">{money(o.total)}</div>
                          <button
                            type="button"
                            onClick={() => setExpanded(e => ({ ...e, [o.shortId]: !e[o.shortId] }))}
                            className={`mt-2 text-xs underline ${textMain}`}
                          >
                            {isOpen ? 'Hide details' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className={`mt-3 border-t ${border} pt-3 space-y-3`}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {o.email && <div className={`${textMain}`}><span className={textSub}>Email:</span> {o.email}</div>}
                            {o.phone && <div className={`${textMain}`}><span className={textSub}>Phone:</span> {o.phone}</div>}
                            {o.type === 'delivery' && o.address && (
                              <div className={`sm:col-span-2 ${textMain}`}><span className={textSub}>Address:</span> {o.address}</div>
                            )}
                          </div>

                          {/* Items list */}
                          <div>
                            <div className={`text-xs ${textSub} mb-1`}>Items</div>
                            <div className="space-y-2 text-sm">
                              {o.items.map((it, idx) => {
                                const extra = (it.addOns || []).reduce((s,a)=> s + (a.delta || 0), 0)
                                return (
                                  <div key={idx}>
                                    <div className="flex items-start justify-between">
                                      <div className={`${textMain}`}>{it.quantity}× {it.name}</div>
                                      <div className={`${textMain} font-medium`}>{money(lineTotal(it))}</div>
                                    </div>
                                    <div className="ml-4 text-xs">
                                      <div className={`${textSub}`}>
                                        Unit: {money(it.unit)}
                                        {extra ? ` • +${money(extra)} add-ons` : ''}
                                      </div>
                                      {(it.addOns || []).map((a,i)=>(
                                        <div key={i} className={`${textDim}`}>
                                          <span className="font-medium">{a.group}:</span> {a.name}{typeof a.delta==='number'&&a.delta!==0?` +${money(a.delta)}`:''}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status buttons */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {STATUSES.filter(s => s !== o.status).map(s => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => changeStatus(o.shortId, s)}
                            className={`text-xs px-2.5 py-1.5 rounded-md border ${border} bg-black text-white hover:bg-black/90 disabled:opacity-60`}
                            disabled={!!busy[o.shortId]}
                          >
                            {LABEL[s]}
                          </button>
                        ))}
                        {busy[o.shortId] && <span className={`text-xs ${textDim}`}>Updating…</span>}
                      </div>
                    </div>
                  )
                })}
                {grouped[status].length === 0 && <div className={`text-xs ${textDim}`}>No orders</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
