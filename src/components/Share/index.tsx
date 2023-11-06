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
      <span className='mr-3 hidden sm:inline md:mr-4'>Compártelo</span>
      <div className='has-tooltip mr-3 inline-block h-4 w-5 md:mr-4'>
        <span
          className={`${
            showTooltip ? 'visible' : 'invisible'
          } shadow-sm tooltip absolute z-10 -ml-4 mt-1 whitespace-nowrap rounded bg-gray-200 p-1 px-2 py-1 text-sm text-primary`}
        >
          ¡Enlace copiado!
        </span>
        <a
          href='#'
          onClick={copyToClipboardHandler}
          rel='noreferrer noopener'
          className='z-1 relative top-2 py-2 hover:text-primary'
          title='Copia el enlace'
        >
          <span className='material-symbols-rounded relative -top-0.5 -rotate-45'>
            link
          </span>
        </a>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`mr-3 inline-block h-4 w-4 hover:text-primary md:mr-4`}
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
        className={`mr-3 inline-block h-4 w-5 hover:text-primary md:mr-4`}
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
        className={`mr-3 inline-block h-4 w-5 hover:text-primary md:mr-4`}
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
        className={`mr-3 inline-block h-4 w-5 hover:text-primary md:mr-4`}
        title='Ver los comentarios'
        onClick={scrollToAnchor}
      >
        <span className='material-symbols-rounded relative top-1.5'>forum</span>
      </a>
    </>
  )
}

export { Share }
