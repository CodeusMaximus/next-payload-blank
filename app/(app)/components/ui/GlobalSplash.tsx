'use client'

import { useEffect, useState } from 'react'
import AlperLoader from './AlperLoader'

export default function GlobalSplash() {
  const [hide, setHide] = useState(false)
  
  useEffect(() => {
    // Wait for site to be fully loaded
    const handleLoad = () => {
      // Add a small delay to ensure everything is ready
      setTimeout(() => setHide(true), 500)
    }

    // If document is already loaded
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      // Wait for load event
      window.addEventListener('load', handleLoad)
      
      // Fallback timeout in case load event doesn't fire
      const fallbackTimer = setTimeout(() => {
        console.log('Fallback: hiding splash after 10 seconds')
        setHide(true)
      }, 10000)
      
      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(fallbackTimer)
      }
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed inset-0 z-[1000] flex items-center justify-center',
        'transition-opacity duration-700',
        hide ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
      style={{
        backgroundColor: '#faf7f0' // Warm tan-yellow background
      }}
    >
      <AlperLoader 
        heightVh={55} 
        stroke={1} // Ultra-thin for elegance
        duration={3.8} // Back to faster speed
        label="Loading…" 
      />
    </div>
  )
}