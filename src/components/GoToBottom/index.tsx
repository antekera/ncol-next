'use client'

import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

const GoToBottom = () => {
  const goToFooter = useCallback(() => {
    const footer = document.querySelector('footer.footer')
    if (footer) {
      const top = footer.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, left: 0, behavior: 'smooth' })
      return
    }
    window.scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }, [])

  const { ref: setObservedNode, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    const footer = document.querySelector('footer.footer')
    if (footer) setObservedNode(footer)
  }, [setObservedNode])

  return (
    <button
      onClick={goToFooter}
      data-testid='button-go-bottom'
      aria-label='Ir al pie de página'
      aria-hidden={inView}
      className={`bg-primary fixed right-6 bottom-24 z-50 h-9 w-9 cursor-pointer rounded-sm border-none text-white transition-all transition-opacity duration-300 ease-in-out hover:bottom-28 md:hidden ${inView ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <ChevronDown size={36} />
    </button>
  )
}

export { GoToBottom }
