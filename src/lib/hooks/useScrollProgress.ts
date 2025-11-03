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

      setCompletion(
        completionCalculated >= 100 ? 100 : Math.max(0, completionCalculated)
      )
    }

    updateScrollCompletion()
    window.addEventListener(SCROLL, updateScrollCompletion)

    return () => {
      window.removeEventListener(SCROLL, updateScrollCompletion)
    }
  }, [height, startY])
  return completion
}
