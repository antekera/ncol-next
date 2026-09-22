'use client'

import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const SHOW_AFTER_SCROLL_Y = 300

const GoToBottom = () => {
  const [hasScrolled, setHasScrolled] = useState(false)

  const goToNextArticleLoader = useCallback(() => {
    const target =
      document.getElementById('next-article-loader') ??
      document.querySelector('footer.footer')
    if (target) {
      const stickyHeader = document.querySelector('header.sticky')
      const headerOffset = stickyHeader?.getBoundingClientRect().height ?? 0
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset - 16
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
  const isHidden = inView || !hasScrolled

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(window.scrollY > SHOW_AFTER_SCROLL_Y)
    }

    const footer = document.querySelector('footer.footer')
    if (footer) setObservedNode(footer)

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })

    return () => window.removeEventListener('scroll', updateScrollState)
  }, [setObservedNode])

  return (
    <button
      onClick={goToNextArticleLoader}
      data-testid='button-go-bottom'
      aria-label='Ir al siguiente artículo'
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
      className={`bg-primary fixed right-6 bottom-24 z-50 h-9 w-9 cursor-pointer rounded-sm border-none text-white transition-all transition-opacity duration-300 ease-in-out hover:brightness-90 md:hidden ${isHidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <ChevronDown size={36} />
    </button>
  )
}

export { GoToBottom }
