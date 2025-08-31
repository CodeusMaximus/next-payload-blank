 // app/api/orders/route.ts (updated)
import { NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { randomBytes } from 'crypto'
import { pusherServer } from '../../lib/pusher/server'

export async function POST(req: Request) {
  const payload = await getPayloadHMR({ config })
  const body = await req.json()

  const { 
    type, 
    name, 
    email, 
    phone, 
    address, 
    notes,
    items = [],
    subtotal,
    total
  } = body || {}

  if (!type || !name || !email || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!items.length) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
  }

  // shortId like ALP-3F9C2
  const shortId = `ALP-${randomBytes(3).toString('hex').toUpperCase()}`

  const orderData = {
    shortId, 
    type, 
    name, 
    email, 
    phone, 
    address,
    notes,
    status: 'received',
    items: items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category || 'other',
      subtotal: item.price * item.quantity
    })),
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    subtotal: subtotal || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
    total: total || subtotal || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  }

  const order = await payload.create({
    collection: 'orders' as any,
    data: orderData,
  })

  // Notify admins dashboard list
  await pusherServer.trigger('orders', 'order:new', {
    id: order.id,
    shortId,
    name,
    type,
    status: order.status,
    total: orderData.total,
    itemCount: orderData.itemCount,
    createdAt: order.createdAt,
  })

  // Also initialize per-order channel for the customer
  await pusherServer.trigger(`order-${shortId}`, 'order:update', {
    status: 'received',
    items: orderData.items
  })

  return NextResponse.json({ 
    id: order.id, 
    shortId,
    message: 'Order placed successfully'
  })
}