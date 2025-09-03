import OrdersBoardClient from './board-client'
// If you want to fetch real orders too, keep your Payload fetch here and pass them in.
// For the demo, we’ll render ONLY demo data (board-client seeds it).

export default async function DashboardOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Live Orders (Demo)</h1>
      <OrdersBoardClient demoOnly={true} startExpanded={true} />
    </div>
  )
}
