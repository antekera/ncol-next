'use client'

import { ChevronUp } from 'lucide-react'
import { useCallback } from 'react'
import { GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

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
      className='link-go-top bg-primary absolute -top-3 right-6 h-9 w-9 cursor-pointer rounded-sm border-none text-white duration-150 ease-in hover:-top-4'
    >
      <ChevronUp size={36} />
    </button>
  )
}

export { ButtonGoTop }
