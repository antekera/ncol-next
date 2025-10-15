'use client'

import { Link, MessageCircleMore } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@components/Icon'
import { CMS_URL, GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
import ContextStateData from '@lib/context/StateContext'
import { cn } from '@lib/shared'

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
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className='share'>
      <span className='share-text'>Compártelo</span>
      <div className='share-tooltip-wrapper'>
        <span
          className={cn('share-tooltip', {
            visible: showTooltip,
            invisible: !showTooltip
          })}
        >
          ¡Enlace copiado!
        </span>
        <button
          onClick={copyToClipboardHandler}
          className='share-button'
          title='Copia el enlace'
        >
          <Link size={20} />
        </button>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className='share-link'
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
        className='share-link-x'
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
        className='share-link-whatsapp'
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
        className='share-link-comments'
        title='Ver los comentarios'
        onClick={scrollToAnchor}
      >
        <MessageCircleMore size={20} className='flex-shrink-0' />
      </a>
    </div>
  )
}

export { Share }