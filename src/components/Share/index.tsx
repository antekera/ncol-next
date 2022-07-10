import { useState } from 'react'

import { LinkIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

import { CMS_URL } from '@lib/constants'

import { Icon } from '..'

const Share = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()

  const URL = `${CMS_URL}${router.asPath}`
  const TEXT_TO_SHARE = `Mira esta noticia publicada en noticiascol.com: ${URL}`

  const copyToClipboardHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    setShowTooltip(true)

    setTimeout(() => setShowTooltip(false), 3000)
    return navigator.clipboard.writeText(TEXT_TO_SHARE)
  }

  return (
    <>
      <span className='hidden mr-4 sm:inline'>Compártelo</span>
      <div className='inline-block w-5 h-4 mr-4 has-tooltip'>
        <span
          className={`${
            showTooltip ? 'visible' : 'invisible'
          } absolute p-1 -mt-1 -ml-4 text-sm bg-gray-200 py-1 px-2 rounded shadow-sm tooltip text-primary whitespace-nowrap`}
        >
          ¡Enlace copiado!
        </span>
        <a
          href='#'
          onClick={copyToClipboardHandler}
          rel='noreferrer noopener'
          className='hover:text-primary'
          title='Copia el enlace'
        >
          <LinkIcon />
        </a>
      </div>
      <a
        href={`https://www.facebook.com/sharer.php?u=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`inline-block w-4 h-4 mr-4 hover:text-primary`}
        title='Compartir en Facebook'
      >
        <Icon network='facebook' width='w-5' />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${URL}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`inline-block w-5 h-4 mr-5 hover:text-primary`}
        title='Compartir en Twitter'
      >
        <Icon network='twitter' width='w-5' />
      </a>
      <a
        href={`whatsapp://send?text=${TEXT_TO_SHARE}`}
        data-action='share/whatsapp/share'
        className={`inline-block w-5 h-4 mr-4 hover:text-primary`}
        title='Compartir por WhatsApp'
      >
        <Icon network='whatsapp' width='w-5' size />
      </a>
    </>
  )
}

export { Share }
