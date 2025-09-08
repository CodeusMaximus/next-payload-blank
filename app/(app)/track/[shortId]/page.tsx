// app/track/[shortId]/page.tsx
import Client from '../[shortId]/track-client'

export default function TrackPage({ params }: { params: { shortId: string } }) {
  return <Client shortId={params.shortId} />
}
