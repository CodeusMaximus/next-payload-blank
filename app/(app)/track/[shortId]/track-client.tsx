// app/track/[shortId]/track-client.tsx
'use client'

import { useEffect, useState } from 'react'
import CustomerProgressModal from '../../components/CustomerProgressModal'

export default function TrackClient({ shortId }: { shortId: string }) {
  const [open, setOpen] = useState(true)
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    // capture origin on client for share link
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* A friendly card behind the modal, in case they close it */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center">
        <h1 className="text-xl font-bold text-slate-800">Track your order</h1>
        <p className="text-slate-600 text-sm mt-1">Order #{shortId}</p>
        <button onClick={() => setOpen(true)} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90">
          Show progress
        </button>
      </div>

      <CustomerProgressModal
        shortId={shortId}
        open={open}
        onClose={() => setOpen(false)}
        trackUrl={`${origin}/track/${shortId}`}
      />
    </div>
  )
}
