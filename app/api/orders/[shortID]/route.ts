// app/api/orders/[shortId]/route.ts
import { NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { pusherServer } from '../../../lib/pusher/server' // keep your relative path or alias
import { auth } from '@clerk/nextjs/server'               // ✅ correct server import
import { sendOrderConfirmedEmail, sendOrderConfirmedSMS } from '../../../lib/notify'

const STATUS_TO_TIMESTAMP_FIELD: Record<string, string | null> = {
  received: null,
  confirmed: 'confirmedAt',
  preparing: 'preparedAt',
  ready: 'readyAt',
  out_for_delivery: 'outForDeliveryAt',
  completed: 'completedAt',
  canceled: null,
}

// Temporary local type to satisfy TS until payload-types are regenerated
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
  { params }: { params: { shortId: string } }
) {
  // ✅ Fixed: await the auth() call
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Read role from session claims (set via Clerk publicMetadata on the user)
  const role =
    // prefer publicMetadata (most common)
    (sessionClaims?.publicMetadata as any)?.role ??
    // fallback just-in-case some setups use top-level metadata
    (sessionClaims as any)?.metadata?.role

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await getPayloadHMR({ config })
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
    collection: 'orders' as any, // remove `as any` after you regenerate payload types
    where: { shortId: { equals: params.shortId } },
    limit: 1,
  })) as unknown as { docs: OrderDoc[] }

  const order = res.docs?.[0]
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Build update payload
  const data: Partial<OrderDoc> & Record<string, any> = { status }
  const timestampField = STATUS_TO_TIMESTAMP_FIELD[status]
  if (timestampField) data[timestampField] = new Date().toISOString()

  const updated = (await payload.update({
    collection: 'orders' as any, // remove `as any` after you regenerate payload types
    id: order.id,
    data,
  })) as unknown as OrderDoc

  // Broadcast to admin board and customer tracker
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

  // On confirm, notify via email/SMS
  if (status === 'confirmed') {
    await Promise.allSettled([
      sendOrderConfirmedEmail(updated.email, updated.name, updated.shortId),
      sendOrderConfirmedSMS(updated.phone, updated.shortId),
    ])
  }

  return NextResponse.json({ ok: true })
}