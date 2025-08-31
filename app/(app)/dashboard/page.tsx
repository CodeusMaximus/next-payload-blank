import { redirect } from 'next/navigation'

export default function DashboardIndex() {
  // send /dashboard → /dashboard/orders
  redirect('/dashboard/orders')
}
