// payload/collections/Orders.ts
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'shortId' },
  access: {
    read: () => true,       // public read OK (customer order page)
    create: () => true,     // public create (from your OrderModal)
    update: () => true,     // we'll gate via API for admin updates
    delete: () => false,
  },
  fields: [
    { name: 'shortId', type: 'text', required: true, unique: true }, // human-friendly track id
    { name: 'type', type: 'select', required: true, options: ['pickup', 'delivery'] },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'address', type: 'textarea' },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      options: ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'canceled'],
    },

    // optional timestamps per stage
    { name: 'confirmedAt', type: 'date' },
    { name: 'preparedAt', type: 'date' },
    { name: 'readyAt', type: 'date' },
    { name: 'outForDeliveryAt', type: 'date' },
    { name: 'completedAt', type: 'date' },
  ],
}

export default Orders
