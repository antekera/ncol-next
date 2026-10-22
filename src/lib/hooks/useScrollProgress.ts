'use client'

import { useEffect, useState } from 'react'

const SCROLL = 'scroll'

/* Indicates the scroll percentage of a given container starting at startY */
export const useScrollProgress = (height: number, startY: number = 0) => {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const updateScrollCompletion = () => {
      const start = startY || 0
      const rawProgress = window.scrollY - start
      const currentProgress = Math.max(0, rawProgress)
      const scrollHeight = Math.max(0, (height || 0) - window.innerHeight)

      let completionCalculated = 0
      if (scrollHeight > 0) {
        completionCalculated = Number(
          ((currentProgress / scrollHeight) * 100).toFixed(2)
        )
      } else {
        // If the content is shorter than the viewport, mark as read when reached
        completionCalculated = window.scrollY >= start ? 100 : 0
      }

      const nextCompletion =
        completionCalculated >= 100 ? 100 : Math.max(0, completionCalculated)

      // Scroll can fire many times for the same rounded percentage. Avoid
      // scheduling redundant React updates from a global event listener.
      setCompletion(current =>
        current === nextCompletion ? current : nextCompletion
      )
    }

    let frame: number | null = null
    const onScroll = () => {
      if (frame !== null) return
      // Defer state updates so scroll emitted during layout cannot recurse into React.
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateScrollCompletion()
      })
    }

    updateScrollCompletion()
    window.addEventListener(SCROLL, onScroll, { passive: true })

    return () => {
      window.removeEventListener(SCROLL, onScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [height, startY])
  return completion
}
