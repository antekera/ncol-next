import { useState } from 'react'

import { useRouter } from 'next/router'

import { Icon } from '@components/Icon'
import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
const SHARE_OPTION = 'SHARE_OPTION'

const Share = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()

  const URL = `${CMS_URL}${router.asPath}`
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
    <>
      <span className='hidden mr-3 md:mr-4 sm:inline'>Compártelo</span>
      <div className='inline-block w-5 h-4 mr-3 md:mr-4 has-tooltip'>
        <span
          className={`${
            showTooltip ? 'visible' : 'invisible'
          } absolute p-1 z-10 mt-1 -ml-4 text-sm bg-gray-200 py-1 px-2 rounded shadow-sm tooltip text-primary whitespace-nowrap`}
        >
          ¡Enlace copiado!
        </span>
        <a
          href='#'
          onClick={copyToClipboardHandler}
          rel='noreferrer noopener'
          className='relative py-2 hover:text-primary top-2 z-1'
          title='Copia el enlace'
        >
          <span className='relative material-symbols-rounded -rotate-45 -top-0.5'>
            link
          </span>
        </a>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`inline-block w-4 h-4 mr-3 md:mr-4 hover:text-primary`}
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
        className={`inline-block w-5 h-4 mr-3 md:mr-4 hover:text-primary`}
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
        className={`inline-block w-5 h-4 mr-3 md:mr-4 hover:text-primary`}
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
        className={`inline-block w-5 h-4 mr-3 md:mr-4 hover:text-primary`}
        title='Ver los comentarios'
        onClick={scrollToAnchor}
      >
        <span className='relative material-symbols-rounded top-1.5'>forum</span>
      </a>
    </>
  )
}

export { Share }
