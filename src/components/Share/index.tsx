'use client'

import { Link, MessageCircleMore } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@components/Icon'
import { CMS_URL, GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
import ContextStateData from '@lib/context/StateContext'

const Share = ({ uri }: { uri: string }) => {
  const { showComments, handleSetContext } = ContextStateData()
  const [showTooltip, setShowTooltip] = useState(false)

  const URL = `${CMS_URL}${uri}`

  const copyToClipboardHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    GAEvent({
      category: GA_EVENTS.SHARE_OPTION.CATEGORY,
      label: GA_EVENTS.SHARE_OPTION.COPY
    })
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 3000)
    return navigator.clipboard.writeText(URL)
  }

  const scrollToAnchor = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    handleSetContext({
      showComments: !showComments
    })

    const anchor = document.querySelector('#comentarios')
    if (anchor) {
      GAEvent({
        category: GA_EVENTS.SHARE_OPTION.CATEGORY,
        label: GA_EVENTS.SHARE_OPTION.COMMENT
      })
      // Smooth scroll with offset to account for fixed header
      const desktop = window.matchMedia('(min-width: 768px)').matches
      const offset = desktop ? 90 : 80
      const top = anchor.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className='flex items-center gap-3 md:gap-0'>
      <span className='hidden font-sans sm:inline md:mr-4'>Compártelo</span>
      <div className='has-tooltip inline-flex h-4 w-5 items-center md:mr-4'>
        <span
          className={`${
            showTooltip ? 'visible' : 'invisible'
          } tooltip text-primary absolute z-10 mt-1 -ml-4 rounded bg-gray-200 p-1 px-2 py-1 text-sm whitespace-nowrap shadow-sm`}
        >
          ¡Enlace copiado!
        </span>
        <button
          onClick={e => void copyToClipboardHandler(e)}
          className='relative z-1 hover:text-slate-700 dark:hover:text-white'
          title='Copia el enlace'
        >
          <Link size={20} />
        </button>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`inline-block h-4 w-4 hover:text-slate-700 md:mr-4 dark:hover:text-white`}
        title='Compartir en Facebook'
        onClick={() =>
          GAEvent({
            category: GA_EVENTS.SHARE_OPTION.CATEGORY,
            label: GA_EVENTS.SHARE_OPTION.FACEBOOK
          })
        }
      >
        <Icon network='facebook' width='w-5' />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`inline-block h-4 w-5 hover:text-slate-700 md:mr-4 dark:hover:text-white`}
        title='Compartir en X'
        onClick={() =>
          GAEvent({
            category: GA_EVENTS.SHARE_OPTION.CATEGORY,
            label: GA_EVENTS.SHARE_OPTION.TWITTER
          })
        }
      >
        <Icon network='x' width='w-5' size='322 380' />
      </a>
      <a
        href={`whatsapp://send?text=${URL}`}
        data-action='share/whatsapp/share'
        className={`inline-block h-4 w-5 hover:text-slate-700 md:mr-4 dark:hover:text-white`}
        title='Compartir por WhatsApp'
        onClick={() =>
          GAEvent({
            category: GA_EVENTS.SHARE_OPTION.CATEGORY,
            label: GA_EVENTS.SHARE_OPTION.WHATSAPP
          })
        }
      >
        <Icon network='whatsapp' width='w-5' size='26 26' />
      </a>
      <a
        href={`#comentarios`}
        className={`relative inline-flex w-5 items-center hover:text-slate-700 md:mr-4 dark:hover:text-white`}
        title='Ver los comentarios'
        onClick={scrollToAnchor}
      >
        <MessageCircleMore size={20} className='flex-shrink-0' />
      </a>
    </div>
  )
}

export { Share }
