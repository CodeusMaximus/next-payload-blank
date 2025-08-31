 import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import OrderTracker from './order-tracker'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { shortId: string }

type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  category: string
  subtotal: number
}

type Order = {
  id: string
  shortId: string
  name: string
  email: string
  phone: string
  type: 'pickup' | 'delivery'
  address?: string
  notes?: string
  status: 'received' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'canceled'
  items: OrderItem[]
  itemCount: number
  subtotal: number
  total: number
  createdAt: string
  confirmedAt?: string
  preparedAt?: string
  readyAt?: string
  outForDeliveryAt?: string
  completedAt?: string
}

export default async function OrderTrackingPage(
  props: { params: Promise<Params> }
) {
  const { shortId } = await props.params
  const payload = await getPayload({ config })

  const res = (await payload.find({
    collection: 'orders' as any,
    where: { shortId: { equals: shortId } },
    limit: 1,
  })) as unknown as { docs: Order[] }

  const order = res.docs?.[0]
  if (!order) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.shortId}</h1>
                <p className="text-blue-100">
                  Placed on {new Date(order.createdAt).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Total</p>
                <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <OrderTracker initialOrder={order} />

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {item.category.replace('-', ' ')} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Subtotal ({order.itemCount} items):</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>{order.type === 'pickup' ? 'Pickup' : 'Delivery'}:</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Customer Name</label>
                    <p className="font-medium">{order.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <p className="font-medium">{order.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Order Type</label>
                    <p className="font-medium capitalize">{order.type}</p>
                  </div>
                  {order.address && order.type === 'delivery' && (
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</label>
                      <p className="font-medium">{order.address}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Special Instructions</label>
                      <p className="font-medium">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
