 'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPusherClient } from '../../../lib/pusher/client'
// inside your OrdersBoardClient component:
import CustomerProgressModal from '../../components/CustomerProgressModal'
// ...
 

 

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-gradient-to-r from-blue-500 to-blue-600',
  confirmed: 'bg-gradient-to-r from-purple-500 to-purple-600',
  preparing: 'bg-gradient-to-r from-amber-500 to-orange-500',
  ready: 'bg-gradient-to-r from-emerald-500 to-green-500',
  out_for_delivery: 'bg-gradient-to-r from-cyan-500 to-teal-500',
  completed: 'bg-gradient-to-r from-green-600 to-emerald-600',
  canceled: 'bg-gradient-to-r from-red-500 to-red-600',
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
    const total = orderTotal(items)
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

// ---------- Printing helpers

function escapeHTML(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function buildReceiptHTML(order: Order) {
  const created = order.createdAt ? new Date(order.createdAt) : new Date()
  const itemsHTML = order.items.map(it => {
    const addOns = (it.addOns || [])
      .map(a => `<div class="addon">- ${escapeHTML(a.name)}${typeof a.delta === 'number' && a.delta !== 0 ? ` (+${money(a.delta)})` : ''}</div>`)
      .join('')
    return `
      <div class="row">
        <div class="left">
          <div class="qty">${it.quantity}×</div>
          <div class="name">${escapeHTML(it.name)}</div>
        </div>
        <div class="right">${money(lineTotal(it))}</div>
      </div>
      ${addOns}
    `
  }).join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket ${escapeHTML(order.shortId)}</title>
  <style>
    /* 1) Hard force ticket page + no margins */
   /* 1) Hard force ticket page + no margins */
@page {
  size: 80mm auto;  /* change to 58mm auto if you use 58mm rolls */
  margin: 0;
}

/* 2) Match content to the roll width. Use auto margins to center if the driver insists on Letter. */
html, body {
  width: 80mm;            /* EXACT roll width */
  margin: 0 auto;         /* <-- centers on Letter/A4 previews */
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.25;
}

/* 3) Receipt content; keep it same width and centered */
.receipt {
  width: 80mm;            /* same as page width */
  margin: 0 auto;         /* center as fallback */
  padding: 0;
}

.center { text-align: center; }
.bold { font-weight: 800; }
.muted { color: #333; }
.line { border-top: 1px dashed #000; margin: 6px 0; }

.row { display: flex; justify-content: space-between; gap: 8px; break-inside: avoid; }
.left { display: flex; gap: 8px; }
.qty { min-width: 18px; text-align: right; }
.name { max-width: 60mm; word-break: break-word; }

.addon { margin-left: 26px; font-size: 12px; color:#111; break-inside: avoid; }
.hdr { font-size: 18px; margin: 0; }
.big { font-size: 20px; }
.pill { display:inline-block; border:1px solid #000; padding:2px 6px; border-radius:999px; font-size:11px; }

.totals .row { font-size: 15px; }
.totals .row.total { font-size: 17px; font-weight: 800; }

/* 4) Double down for print engines that ignore @page */
@media print {
  html, body { width: 80mm; margin: 0 auto; padding: 0; }
}

  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <div class="hdr bold">ALP Grocery & Deli</div>
      <div class="muted">${created.toLocaleDateString()} ${created.toLocaleTimeString()}</div>
      <div style="margin-top:8px">
        <span class="pill">#${escapeHTML(order.shortId)}</span>
        &nbsp;
        <span class="pill">${order.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}</span>
      </div>
    </div>

    <div style="margin-top:12px">
      <div class="big bold">${escapeHTML(order.name)}</div>
      ${order.phone ? `<div class="muted">📞 ${escapeHTML(order.phone)}</div>` : ''}
      ${order.type === 'delivery' && order.address ? `<div class="muted">📍 ${escapeHTML(order.address)}</div>` : ''}
    </div>

    <div class="line"></div>

    <div class="items">
      ${itemsHTML}
    </div>

    <div class="line"></div>

    <div class="totals">
      <div class="row"><div>Subtotal</div><div>${money(orderTotal(order.items))}</div></div>
      <div class="row total"><div>Total</div><div>${money(order.total || orderTotal(order.items))}</div></div>
    </div>

    <div class="center" style="margin-top:12px" class="muted">Thank you!</div>
  </div>

  <script>
    // Auto-print on load
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function(){ window.close && window.close(); }, 250);
      }, 50);
    };
  </script>
</body>
</html>`
}

function printOrderTicket(order: Order) {
  if (typeof document === 'undefined') return;

  const html = buildReceiptHTML(order);

  // Create a hidden iframe that contains the receipt
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  (iframe as any).srcdoc = html;

  document.body.appendChild(iframe);

  // When the iframe loads, call print() on its window
  const cleanup = () => {
    try { document.body.removeChild(iframe); } catch {}
  };

  const onLoad = () => {
    try {
      const win = iframe.contentWindow;
      if (!win) { cleanup(); return; }

      const afterPrint = () => {
        win.removeEventListener?.('afterprint', afterPrint);
        cleanup();
      };
      win.addEventListener?.('afterprint', afterPrint);

      win.focus();
      setTimeout(() => {
        try { win.print(); } catch { cleanup(); }
      }, 50);
    } catch {
      cleanup();
    }
  };

  iframe.onload = onLoad;
}

// ---------- Component

export default function OrdersBoardClient({
  initialOrders = [],
  demoOnly = true,
  startExpanded = true,
}: {
  initialOrders?: Order[]
  demoOnly?: boolean
  startExpanded?: boolean
}) {
  const seeded = (initialOrders.length ? initialOrders : seedDemo()).map(o => ({
    ...o,
    total: typeof o.total === 'number' && o.total > 0 ? o.total : orderTotal(o.items),
  }))

  const [orders, setOrders] = useState<Order[]>(seeded)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(seeded.map(o => [o.shortId, startExpanded]))
  )
  const [active, setActive] = useState<'all' | OrderStatus>('all')
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    // 🔔 Customer progress modal state (MUST be inside the component)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyOrder, setNotifyOrder] = useState<{ shortId: string } | null>(null)


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
  setBusy(b => ({ ...b, [shortId]: true }))
  const prev = orders
  const optimistic = orders.map(o => o.shortId === shortId ? { ...o, status: next } : o)
  setOrders(optimistic)

  try {
    if (!demoOnly) {
      await fetch(`/api/orders/${shortId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      }).then(r => { if (!r.ok) throw new Error('bad status') })
    }

    // ✅ open the customer progress modal here
    setNotifyOrder({ shortId })
    setNotifyOpen(true)

  } catch {
    if (!demoOnly) setOrders(prev)
  } finally {
    setBusy(b => ({ ...b, [shortId]: false }))
  }
}


  const visible = active === 'all' ? STATUSES : [active]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Orders Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">{active === 'all' ? 'All Orders' : LABEL[active]}</p>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{counts.all}</div>
                <div className="text-xs text-slate-500">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{counts.received + counts.confirmed + counts.preparing}</div>
                <div className="text-xs text-slate-500">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Mobile Filters Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
              <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Filter Orders</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      ×
                    </button>
                  </div>
                  <FilterButtons 
                    active={active}
                    counts={counts}
                    onSelect={(status) => {
                      setActive(status)
                      setMobileMenuOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Filter Orders</h2>
                <FilterButtons 
                  active={active}
                  counts={counts}
                  onSelect={setActive}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            <div className={`grid gap-6 ${active === 'all' ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
              {visible.map(status => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold shadow-lg ${STATUS_COLORS[status]}`}>
                      <span className="text-sm">{LABEL[status]}</span>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{grouped[status].length}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {grouped[status].map(o => {
                      const isOpen = !!expanded[o.shortId]
                      return (
                        <OrderCard
                          key={o.shortId}
                          order={o}
                          isOpen={isOpen}
                          busy={!!busy[o.shortId]}
                          onToggle={() => setExpanded(e => ({ ...e, [o.shortId]: !e[o.shortId] }))}
                          onStatusChange={(status) => changeStatus(o.shortId, status)}
                          onPrint={() => printOrderTicket(o)}
                        />
                      )
                    })}
                    {grouped[status].length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <div className="text-4xl mb-2">📋</div>
                        <div className="text-sm">No {LABEL[status].toLowerCase()} orders</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      {notifyOrder && (
  <CustomerProgressModal
    shortId={notifyOrder.shortId}
    open={notifyOpen}
    onClose={() => setNotifyOpen(false)}
    trackUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/track/${notifyOrder.shortId}`}
  />
)}

    </div>
  )
}

function FilterButtons({ 
  active, 
  counts, 
  onSelect 
}: { 
  active: 'all' | OrderStatus
  counts: Record<'all'|OrderStatus, number>
  onSelect: (status: 'all' | OrderStatus) => void 
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelect('all')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
          active === 'all' 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg' 
            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
        }`}
      >
        <span>All Orders</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          active === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {counts.all}
        </span>
      </button>

      {STATUSES.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all capitalize ${
            active === s
              ? `${STATUS_COLORS[s]} text-white shadow-lg`
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span>{LABEL[s]}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            active === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {counts[s]}
          </span>
        </button>
      ))}
    </div>
  )
}

function OrderCard({ 
  order, 
  isOpen, 
  busy, 
  onToggle, 
  onStatusChange,
  onPrint,
}: {
  order: Order
  isOpen: boolean
  busy: boolean
  onToggle: () => void
  onStatusChange: (status: OrderStatus) => void
  onPrint: () => void
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-slate-500">#{order.shortId}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                order.type === 'pickup' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              }`}>
                {order.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{order.name}</h3>
            {order.createdAt && (
              <p className="text-sm text-slate-500">
                {tTime(order.createdAt)} • {tDate(order.createdAt)}
              </p>
            )}
          </div>

          {/* Amount + Print */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                {money(order.total)}
              </div>
              <button
                onClick={onPrint}
                title="Print ticket"
                aria-label="Print ticket"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95 transition"
              >
                {/* Printer Icon (SVG) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2h-2M7 17h10v4H7v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <button
              onClick={onToggle}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
            >
              {isOpen ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-slate-100 pt-4 space-y-4 animate-in slide-in-from-top duration-300">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {order.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">📞</span>
                  <span className="text-slate-800">{order.phone}</span>
                </div>
              )}
              {order.email && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">✉️</span>
                  <span className="text-slate-800">{order.email}</span>
                </div>
              )}
              {order.type === 'delivery' && order.address && (
                <div className="md:col-span-2 flex items-start gap-2">
                  <span className="text-slate-500">📍</span>
                  <span className="text-slate-800">{order.address}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-bold text-slate-600 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => {
                  const extra = (item.addOns || []).reduce((s,a)=> s + (a.delta || 0), 0)
                  return (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold mr-2">
                              {item.quantity}×
                            </span>
                            {item.name}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          {money(lineTotal(item))}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        Unit price: {money(item.unit)}
                        {extra > 0 && ` • Add-ons: +${money(extra)}`}
                      </div>
                      {(item.addOns || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(item.addOns || []).map((addon, i) => (
                            <span key={i} className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs">
                              {addon.name}
                              {typeof addon.delta === 'number' && addon.delta !== 0 && ` +${money(addon.delta)}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Status Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {STATUSES.filter(s => s !== order.status).map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                disabled={busy}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 ${STATUS_COLORS[s]} hover:shadow-lg hover:scale-105`}
              >
                {LABEL[s]}
              </button>
            ))}
            {busy && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
