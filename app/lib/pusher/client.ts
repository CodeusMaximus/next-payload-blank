// app/lib/pusher/client.ts
import Pusher from 'pusher-js'

let _client: Pusher | null = null

export function getPusherClient(): Pusher {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient() must be called in the browser')
  }
  if (!_client) {
    _client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  }
  return _client
}
