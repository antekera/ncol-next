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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, setScroll])

  return scroll
}
