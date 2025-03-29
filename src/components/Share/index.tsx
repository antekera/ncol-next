'use client'

import { Link, MessageCircleMore } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Icon } from '@components/Icon'
import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

const SHARE_OPTION = 'SHARE_OPTION'

const Share = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const pathname = usePathname()

  const URL = `${CMS_URL}${pathname}`
  const TEXT_TO_SHARE = `Mira esta noticia publicada en noticiascol.com: ${URL}`

  const copyToClipboardHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    GAEvent({
      category: SHARE_OPTION,
      label: 'COPY'
    })
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 3000)
    return navigator.clipboard.writeText(TEXT_TO_SHARE)
  }

  const scrollToAnchor = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const anchor = document.querySelector('#comentarios')
    if (anchor) {
      GAEvent({
        category: SHARE_OPTION,
        label: 'COMMENT'
      })
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className='flex items-center gap-3 md:gap-0'>
      <span className='hidden font-sans sm:inline md:mr-4'>Compártelo</span>
      <div className='has-tooltip inline-block h-4 w-5 md:mr-4'>
        <span
          className={`${
            showTooltip ? 'visible' : 'invisible'
          } tooltip text-primary absolute z-10 mt-1 -ml-4 rounded bg-gray-200 p-1 px-2 py-1 text-sm whitespace-nowrap shadow-sm`}
        >
          ¡Enlace copiado!
        </span>
        <button
          onClick={copyToClipboardHandler}
          className='hover:text-primary hover:dark:text-secondary relative z-1'
          title='Copia el enlace'
        >
          <Link size={20} />
        </button>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`hover:text-primary hover:dark:text-secondary inline-block h-4 w-4 md:mr-4`}
        title='Compartir en Facebook'
        onClick={() =>
          GAEvent({
            category: SHARE_OPTION,
            label: 'FACEBOOK'
          })
        }
      >
        <Icon network='facebook' width='w-5' />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`hover:text-primary hover:dark:text-secondary inline-block h-4 w-5 md:mr-4`}
        title='Compartir en X'
        onClick={() =>
          GAEvent({
            category: SHARE_OPTION,
            label: 'TWITTER'
          })
        }
      >
        <Icon network='x' width='w-5' size='322 380' />
      </a>
      <a
        href={`whatsapp://send?text=${TEXT_TO_SHARE}`}
        data-action='share/whatsapp/share'
        className={`hover:text-primary hover:dark:text-secondary inline-block h-4 w-5 md:mr-4`}
        title='Compartir por WhatsApp'
        onClick={() =>
          GAEvent({
            category: SHARE_OPTION,
            label: 'WHATSAPP'
          })
        }
      >
        <Icon network='whatsapp' width='w-5' size='26 26' />
      </a>
      <a
        href={`#comentarios`}
        className={`hover:text-primary hover:dark:text-secondary relative block inline-block w-5 md:mr-4`}
        title='Ver los comentarios'
        onClick={scrollToAnchor}
      >
        <MessageCircleMore size={22} />
      </a>
    </div>
  )
}

export { Share }
