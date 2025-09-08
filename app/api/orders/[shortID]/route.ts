// app/api/orders/[shortID]/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pusherServer } from '../../../lib/pusher/server'
import { auth } from '@clerk/nextjs/server'
import { sendOrderConfirmedEmail, sendOrderConfirmedSMS } from '../../../lib/notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type OrderStatus =
  | 'received' | 'confirmed' | 'preparing' | 'ready'
  | 'out_for_delivery' | 'completed' | 'canceled'
type OrderType = 'pickup' | 'delivery'

type OrderDoc = {
  id: string
  shortId: string
  name: string
  email: string
  phone: string
  type: OrderType
  status: OrderStatus
  createdAt?: string
  confirmedAt?: string
  preparedAt?: string
  readyAt?: string
  outForDeliveryAt?: string
  completedAt?: string
}

const STATUS_TO_TIMESTAMP_FIELD: Record<OrderStatus, string | null> = {
  received: null,
  confirmed: 'confirmedAt',
  preparing: 'preparedAt',
  ready: 'readyAt',
  out_for_delivery: 'outForDeliveryAt',
  completed: 'completedAt',
  canceled: null,
}

// ---------- helpers ----------
type Params = { shortId?: string; shortID?: string; id?: string }

function pickShortId(p: Params): string | null {
  const raw = p.shortId ?? p.shortID ?? p.id
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed.length ? trimmed : null
}

function toSafe(o: OrderDoc) {
  return {
    id: o.id,
    shortId: o.shortId,
    name: o.name,
    type: o.type,
    status: o.status,
    createdAt: o.createdAt ?? null,
    confirmedAt: (o as any).confirmedAt ?? null,
    preparedAt: (o as any).preparedAt ?? null,
    readyAt: (o as any).readyAt ?? null,
    outForDeliveryAt: (o as any).outForDeliveryAt ?? null,
    completedAt: (o as any).completedAt ?? null,
  }
}

// ---------- GET ----------
export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> } // <-- params is a Promise in your setup
) {
  const params = await ctx.params
  const raw = pickShortId(params)
  if (!raw) return NextResponse.json({ error: 'Bad shortId' }, { status: 400 })

  const payload = await getPayload({ config })

  // Try common variants of shortId + allow direct document id
  const variants = Array.from(new Set([raw, raw.toUpperCase(), raw.toLowerCase()]))

  const res = await payload.find({
    collection: 'orders' as any,
    where: {
      or: [
        ...variants.map(v => ({ shortId: { equals: v } })),
        { id: { equals: raw } },
      ],
    },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  }) as unknown as { docs: OrderDoc[] }

  const order = res.docs?.[0]
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(toSafe(order))
}

// ---------- PATCH ----------
export async function PATCH(
  req: Request,
  ctx: { params: Promise<Params> } // <-- await it here too
) {
  const params = await ctx.params
  const raw = pickShortId(params)
  if (!raw) return NextResponse.json({ error: 'Bad shortId' }, { status: 400 })

  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role =
    (sessionClaims?.publicMetadata as any)?.role ??
    (sessionClaims as any)?.metadata?.role
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status } = (await req.json().catch(() => ({}))) as { status?: OrderStatus }
  const allowed: OrderStatus[] = ['received','confirmed','preparing','ready','out_for_delivery','completed','canceled']
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'orders' as any,
    where: {
      or: [
        { shortId: { equals: raw } },
        { id: { equals: raw } },
      ],
    },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  }) as unknown as { docs: OrderDoc[] }

  const order = found.docs?.[0]
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Partial<OrderDoc> & Record<string, any> = { status }
  const tsField = STATUS_TO_TIMESTAMP_FIELD[status]
  if (tsField) data[tsField] = new Date().toISOString()

  const updated = await payload.update({
    collection: 'orders' as any,
    id: order.id,
    data,
    overrideAccess: true,
  }) as unknown as OrderDoc

  await Promise.all([
    pusherServer.trigger('orders', 'order:update', {
      id: updated.id,
      shortId: updated.shortId,
      status: updated.status,
    }),
    pusherServer.trigger(`order-${updated.shortId}`, 'order:update', {
      status: updated.status,
    }),
  ])

  if (status === 'confirmed') {
    await Promise.allSettled([
      sendOrderConfirmedEmail(updated.email, updated.name, updated.shortId),
      sendOrderConfirmedSMS(updated.phone, updated.shortId),
    ])
  }

  return NextResponse.json(toSafe(updated))
}
