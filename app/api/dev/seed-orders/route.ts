import { NextResponse } from 'next/server'

// If you have path alias '@' set to project root, keep this:
let pusherServer: { trigger: (ch: string, ev: string, data: any) => Promise<any> } | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pusherServer = require('@/lib/pusher/server').pusherServer
} catch (_) {
  // fallback: no pusher in dev
  pusherServer = null
}

// Payload is optional in this seeder — we’ll try it and fall back if not available
let getPayload: any = null
let payloadConfig: any = null
try {
  getPayload = require('payload').getPayload
  payloadConfig = require('@payload-config').default
} catch (_) {
  // no payload, we’ll still broadcast mock orders so the board shows them
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function nowIso() { return new Date().toISOString() }

const MOCK = [
  {
    shortId: 'A1B2C3',
    name: 'Maria Lopez',
    email: 'maria@example.com',
    phone: '(917) 555-1212',
    type: 'pickup' as const,
    status: 'received' as const,
    items: [
      { name: 'Rotisserie Chicken (Whole)', quantity: 1, price: 10.99 },
      { name: 'Caesar Salad (Large)', quantity: 1, price: 7.49 },
      { name: 'Sourdough Bread', quantity: 1, price: 3.99 },
    ],
  },
  {
    shortId: 'D4E5F6',
    name: 'Samir Khan',
    email: 'samir@example.com',
    phone: '(347) 555-0101',
    type: 'delivery' as const,
    status: 'confirmed' as const,
    address: '215 Richmond Ave, Staten Island, NY 10302',
    items: [
      { name: 'Turkey Club Sandwich', quantity: 2, price: 8.99 },
      { name: 'Iced Tea (Bottle)', quantity: 2, price: 2.49 },
      { name: 'Kettle Chips (Sea Salt)', quantity: 1, price: 1.99 },
    ],
  },
  {
    shortId: 'G7H8J9',
    name: 'Alexis Chen',
    email: 'alexis@example.com',
    phone: '(646) 555-3344',
    type: 'pickup' as const,
    status: 'preparing' as const,
    items: [
      { name: 'Breakfast Burrito', quantity: 1, price: 6.99 },
      { name: 'Fresh Orange Juice (12oz)', quantity: 1, price: 3.49 },
      { name: 'Blueberries (Pint)', quantity: 1, price: 4.99 },
    ],
  },
  {
    shortId: 'K1L2M3',
    name: 'David Rossi',
    email: 'drossi@example.com',
    phone: '(929) 555-7788',
    type: 'delivery' as const,
    status: 'ready' as const,
    address: '88 Bay St, Staten Island, NY 10301',
    items: [
      { name: 'Italian Combo Hero', quantity: 1, price: 9.99 },
      { name: 'San Pellegrino (Lemon)', quantity: 1, price: 2.29 },
      { name: 'Bananas (3 ct)', quantity: 1, price: 1.39 },
    ],
  },
  {
    shortId: 'N4P5Q6',
    name: 'Emily Carter',
    email: 'emilyc@example.com',
    phone: '(917) 555-8866',
    type: 'pickup' as const,
    status: 'out_for_delivery' as const, // just to show all columns moving
    items: [
      { name: 'Greek Salad (Large)', quantity: 1, price: 7.49 },
      { name: 'Grilled Chicken Breast (8oz)', quantity: 1, price: 5.99 },
      { name: 'Avocado (2 ct)', quantity: 1, price: 3.50 },
    ],
  },
].map(o => ({
  ...o,
  total: o.items.reduce((t, it) => t + it.price * it.quantity, 0),
  createdAt: nowIso(),
}))

async function seed() {
  const created: any[] = []
  let payload: any = null

  // Try to persist in Payload CMS if available
  if (getPayload && payloadConfig) {
    try {
      payload = await getPayload({ config: payloadConfig })
      for (const order of MOCK) {
        const doc = await payload.create({
          collection: 'orders' as any,
          data: {
            shortId: order.shortId,
            name: order.name,
            email: order.email,
            phone: order.phone,
            address: (order as any).address,
            type: order.type,
            status: order.status,
            total: order.total,
            items: order.items,
          },
        })
        created.push(doc)
      }
    } catch (e: any) {
      // If Payload write fails, we still want the demo to show via realtime
      console.error('Payload seed error:', e?.message || e)
    }
  }

  // Broadcast to Pusher (board listens to order:new)
  for (const doc of created.length ? created : MOCK) {
    try {
      if (pusherServer) {
        await pusherServer.trigger('orders', 'order:new', doc)
      }
    } catch (e) {
      console.error('Pusher trigger error:', e)
    }
  }

  return { persisted: created.length, sent: (created.length ? created : MOCK).length }
}

export async function GET() {
  const res = await seed()
  return NextResponse.json({ ok: true, ...res })
}

export async function POST() {
  const res = await seed()
  return NextResponse.json({ ok: true, ...res })
}
