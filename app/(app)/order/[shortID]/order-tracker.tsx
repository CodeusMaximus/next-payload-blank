 'use client'
// app/order/[shortId]/order-tracker.tsx
import { useEffect, useState } from 'react'
import { getPusherClient } from '../../../lib/pusher/client'
import { CheckCircle, Clock, Truck, Package, MapPin, Ban } from 'lucide-react'

type OrderStatus = 'received' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'canceled'

interface Order {
  shortId: string
  status: OrderStatus
  type: 'pickup' | 'delivery'
  createdAt: string
  confirmedAt?: string
  preparedAt?: string
  readyAt?: string
  outForDeliveryAt?: string
  completedAt?: string
}

interface OrderTrackerProps {
  initialOrder: Order
}

const STATUS_STEPS = {
  pickup: [
    { key: 'received', label: 'Order Received', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Clock },
    { key: 'ready', label: 'Ready for Pickup', icon: MapPin },
    { key: 'completed', label: 'Order Complete', icon: CheckCircle },
  ],
  delivery: [
    { key: 'received', label: 'Order Received', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Clock },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'completed', label: 'Delivered', icon: CheckCircle },
  ]
} as const

const STATUS_MESSAGES = {
  received: 'We\'ve received your order and will begin processing it shortly.',
  confirmed: 'Your order has been confirmed! We\'ll start preparing it now.',
  preparing: 'Our team is carefully preparing your order.',
  ready: 'Your order is ready!',
  out_for_delivery: 'Your order is on its way to you!',
  completed: 'Your order has been completed. Thank you for your business!',
  canceled: 'This order has been canceled. Please contact us if you have questions.'
} as const

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return null
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export default function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order>(initialOrder)

  useEffect(() => {
    const client = getPusherClient()
    const channelName = `order-${order.shortId}`
    const ch = client.subscribe(channelName)

    const onUpdate = (data: { status: OrderStatus }) => {
      setOrder(prev => ({
        ...prev,
        status: data.status,
        // Add timestamp for the new status
        [`${data.status}At`]: new Date().toISOString()
      }))
    }

    ch.bind('order:update', onUpdate)

    return () => {
      ch.unbind('order:update', onUpdate)
      client.unsubscribe(channelName)
    }
  }, [order.shortId])

  if (order.status === 'canceled') {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Order Canceled</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {STATUS_MESSAGES.canceled}
          </p>
        </div>
      </div>
    )
  }

  const steps = STATUS_STEPS[order.type]
  const currentStepIndex = steps.findIndex(step => step.key === order.status)
  
  return (
    <div className="p-6">
      {/* Current Status Message */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {steps[currentStepIndex]?.label || 'Processing'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {STATUS_MESSAGES[order.status]}
        </p>
        {order.type === 'pickup' && order.status === 'ready' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              📍 Your order is ready for pickup at our store!
            </p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const timestamp = order[`${step.key}At` as keyof Order] as string | undefined

            return (
              <div key={step.key} className="flex flex-col items-center relative">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors z-10
                  ${isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                  ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-800' : ''}
                `}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center max-w-[100px]">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimestamp(timestamp)}
                    </p>
                  )}
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    absolute top-6 left-6 w-full h-0.5 -z-10
                    ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Estimated Time */}
      {order.status !== 'completed' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.type === 'pickup' 
              ? 'Estimated pickup time: 15-25 minutes'
              : 'Estimated delivery time: 30-45 minutes'
            }
          </p>
        </div>
      )}
    </div>
  )
}