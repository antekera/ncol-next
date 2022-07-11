import { useState, useEffect } from 'react'

/* Indicates the scroll percentage of a given container */
export const useScrollProgress = (height: number) => {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY
      let scrollHeight = height - window.innerHeight
      let completionCalculated =
        Number((currentProgress / scrollHeight).toFixed(2)) * 100
      if (scrollHeight) {
        setCompletion(completionCalculated >= 100 ? 100 : completionCalculated)
      }
    }
    window.addEventListener('scroll', updateScrollCompletion)

    return () => {
      window.removeEventListener('scroll', updateScrollCompletion)
    }
  }, [])
  return completion
}
