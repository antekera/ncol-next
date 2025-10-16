'use client'

import { ChevronUp } from 'lucide-react'
import { useCallback } from 'react'
import { GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
import './button-go-top.css'

const ButtonGoTop = () => {
  const goToTop = useCallback(() => {
    GAEvent({
      category: GA_EVENTS.GO_TOP_BUTTON.CATEGORY,
      label: GA_EVENTS.GO_TOP_BUTTON.LABEL
    })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      onClick={goToTop}
      data-testid='button-go-top'
      className='button-go-top'
    >
      <ChevronUp size={36} />
    </button>
  )
}

export { ButtonGoTop }