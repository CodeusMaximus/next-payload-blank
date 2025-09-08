 // app/(app)/track/[shortId]/page.tsx
import Client from './track-client'

export const dynamic = 'force-dynamic' // optional, but good if you live-subscribe

type Params = { shortId: string }

export default async function TrackPage({
  params,
}: {
  params: Promise<Params> // <-- params is a Promise in your setup
}) {
  const { shortId } = await params
  return <Client shortId={shortId} />
}
