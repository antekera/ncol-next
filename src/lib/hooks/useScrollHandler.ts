import { useEffect, useRef, useState } from 'react'

/* Indicates when the page has been scrolled */
export const useScrollHandler = (val: number) => {
  const [scroll, setScroll] = useState(false)
  const lastY = useRef(0)
  const currentScrollRef = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      const threshold = 4
      const isScrollingDown = delta > threshold
      const isScrollingUp = delta < -threshold

      let next: boolean
      if (isScrollingDown) {
        next = y > val
      } else if (isScrollingUp) {
        next = false
      } else {
        lastY.current = y
        return
      }

      if (next !== currentScrollRef.current) {
        currentScrollRef.current = next
        setScroll(next)
      }

      lastY.current = y
    }

    // Initialize lastY on mount
    lastY.current = typeof window !== 'undefined' ? window.scrollY : 0
    currentScrollRef.current = false
    document.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [val])

  return scroll
}
