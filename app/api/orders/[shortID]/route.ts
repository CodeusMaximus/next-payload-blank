// app/api/orders/[shortId]/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pusherServer } from '../../../lib/pusher/server'
import { auth } from '@clerk/nextjs/server'
import { sendOrderConfirmedEmail, sendOrderConfirmedSMS } from '../../../lib/notify'

export const runtime = 'nodejs'

const STATUS_TO_TIMESTAMP_FIELD: Record<string, string | null> = {
  received: null,
  confirmed: 'confirmedAt',
  preparing: 'preparedAt',
  ready: 'readyAt',
  out_for_delivery: 'outForDeliveryAt',
  completed: 'completedAt',
  canceled: null,
}

type OrderDoc = {
  id: string
  shortId: string
  name: string
  email: string
  phone: string
  type: 'pickup' | 'delivery'
  status:
    | 'received'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'completed'
    | 'canceled'
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }   // 👈 async params
) {
  const { shortId } = await ctx.params              // 👈 await them

  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role =
    (sessionClaims?.publicMetadata as any)?.role ??
    (sessionClaims as any)?.metadata?.role
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const payload = await getPayload({ config })
  const { status } = await req.json()

  const allowed = [
    'received',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'completed',
    'canceled',
  ] as const
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Find by shortId
  const res = (await payload.find({
    collection: 'orders' as any,
    where: { shortId: { equals: shortId } },
    limit: 1,
  })) as unknown as { docs: OrderDoc[] }

  const order = res.docs?.[0]
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build update
  const data: Partial<OrderDoc> & Record<string, any> = { status }
  const tsField = STATUS_TO_TIMESTAMP_FIELD[status]
  if (tsField) data[tsField] = new Date().toISOString()

  const updated = (await payload.update({
    collection: 'orders' as any,
    id: order.id,
    data,
  })) as unknown as OrderDoc

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

  return NextResponse.json({ ok: true })
}
