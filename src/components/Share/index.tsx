'use client'

import { Share2, Link } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon } from '@components/Icon'
import { CMS_URL, GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

type ShareProps = { uri: string }

const Share = ({ uri }: ShareProps) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [supportsNativeShare, setSupportsNativeShare] = useState<
    boolean | null
  >(null)
  const URL = `${CMS_URL}${uri}`

  useEffect(() => {
    setSupportsNativeShare(
      typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ url: URL }))
    )
  }, [URL])

  const nativeShareHandler = async () => {
    GAEvent({
      category: GA_EVENTS.SHARE_OPTION.CATEGORY,
      label: 'NATIVE'
    })

    if (
      typeof navigator === 'undefined' ||
      typeof navigator.share !== 'function'
    )
      return

    await navigator.share({
      title: document.title,
      text: document.title,
      url: URL
    })
  }

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

  if (supportsNativeShare === null) {
    return <div className='h-[10px]' />
  }

  if (supportsNativeShare) {
    return (
      <div className='flex h-[10px] items-center gap-3 md:gap-0'>
        <button
          onClick={() => void nativeShareHandler()}
          className='inline-flex items-center gap-2 rounded-full border border-slate-300 font-sans text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white'
          title='Compartir'
          type='button'
        >
          <Share2 size={18} />
          Compartir
        </button>
      </div>
    )
  }

  return (
    <div className='flex h-[10px] items-center gap-3 md:gap-0'>
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
    </div>
  )
}

export { Share }
