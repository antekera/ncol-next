import { useState, useEffect } from 'react'

/* Indicates when the page has been scrolled */
export const useScrollHandler = (val: number) => {
  const [scroll, setScroll] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollCheck = window.scrollY > val
      setScroll(scrollCheck)
    }

    document.addEventListener('scroll', onScroll)

    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [scroll, setScroll])

  return scroll
}
