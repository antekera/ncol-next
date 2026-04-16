'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Wraps the header ad in a sticky container at z-30.
 * Watches the nav <header> element via IntersectionObserver — when the header
 * leaves the viewport the ad is hidden. Resets on navigation.
 * Only hides after the user has scrolled (scrollY > 0) to avoid false
 * positives on mobile where the browser chrome shifts the viewport on load.
 */
export function StickyHeaderAd({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHidden(false)
    const header = document.querySelector('header')
    if (!header) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only hide if the user has actually scrolled — avoids mobile browser
        // chrome causing a false "not intersecting" on initial load.
        if (!entry.isIntersecting && window.scrollY > 0) {
          setHidden(true)
        } else {
          setHidden(false)
        }
      },
      { threshold: 0 }
    )
    observer.observe(header)
    return () => observer.disconnect()
  }, [pathname])

  return (
    <div className={`sticky top-0 z-30 ${hidden ? 'hidden' : ''}`}>
      {children}
    </div>
  )
}
