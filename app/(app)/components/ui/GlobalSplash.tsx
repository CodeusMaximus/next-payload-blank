'use client'

import { useEffect, useState } from 'react'
import AlperLoader from './AlperLoader'

export default function GlobalSplash() {
  const [hide, setHide] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHide(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed inset-0 z-[1000] flex items-center justify-center',
        'bg-white dark:bg-black',
        'transition-opacity duration-500',
        hide ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      {/* ⬇️ replace size={300} with heightVh / stroke / duration if you want */}
      <AlperLoader heightVh={36} stroke={10} duration={3.6} label="Loading…" />
      {/* or just <AlperLoader /> to use defaults */}
    </div>
  )
}
