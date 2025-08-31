// app/(app)/dashboard/orders/page.tsx
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import OrdersBoardClient from './board-client'

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
  createdAt?: string
}

export default async function DashboardOrdersPage() {
  // No need for auth() call since middleware handles protection
  const payload = await getPayloadHMR({ config })
  const res = (await payload.find({
    collection: 'orders' as any, // remove `as any` after payload types regen
    sort: '-createdAt',
    limit: 30,
  })) as unknown as { docs: OrderDoc[] }

  return (
    <div className="container mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">Live Orders</h1>
      <OrdersBoardClient initialOrders={res.docs} />
    </div>
  )
}