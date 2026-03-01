'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@components/Icon'
import { X } from 'lucide-react'

const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VbALBGh77qVUp56yeN1b'
const FACEBOOK_URL = 'https://www.facebook.com/noticiasdelacol/'

const SocialBanners = () => {
  const [showWhatsapp, setShowWhatsapp] = useState(false)
  const [showFacebook, setShowFacebook] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const waDismissed = localStorage.getItem('ncol_wa_dismissed') === 'true'
    const fbDismissed = localStorage.getItem('ncol_fb_dismissed') === 'true'

    if (!waDismissed) {
      setTimeout(() => setShowWhatsapp(true), 3000)
    } else if (!fbDismissed) {
      setTimeout(() => setShowFacebook(true), 3000)
    }
  }, [])

  const handleDismissWhatsapp = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowWhatsapp(false)
      setIsClosing(false)
      localStorage.setItem('ncol_wa_dismissed', 'true')

      const fbDismissed = localStorage.getItem('ncol_fb_dismissed') === 'true'
      if (!fbDismissed) {
        setTimeout(() => setShowFacebook(true), 1000)
      }
    }, 300)
  }

  const handleDismissFacebook = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowFacebook(false)
      setIsClosing(false)
      localStorage.setItem('ncol_fb_dismissed', 'true')
    }, 300)
  }

  if (!isMounted) return null

  if (!showWhatsapp && !showFacebook) return null

  const isWhatsapp = showWhatsapp
  const handleDismiss = isWhatsapp
    ? handleDismissWhatsapp
    : handleDismissFacebook
  const title = isWhatsapp
    ? '¡Únete a nuestro canal!'
    : '¡Síguenos en Facebook!'
  const description = isWhatsapp
    ? 'Recibe las noticias más importantes directamente en tu WhatsApp.'
    : 'Mantente informado y únete a nuestra comunidad en Facebook.'
  const url = isWhatsapp ? WHATSAPP_URL : FACEBOOK_URL
  const iconNetwork = isWhatsapp ? 'whatsapp' : 'facebook'
  const buttonText = isWhatsapp ? 'Seguir en WhatsApp' : 'Seguir en Facebook'

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 w-80 rounded-xl border border-gray-100 bg-white p-4 font-sans shadow-xl transition-transform duration-300 ease-in-out dark:border-neutral-700 dark:bg-neutral-800 ${
        isClosing ? 'translate-x-[150%]' : 'translate-x-0'
      }`}
      style={{
        animation: !isClosing ? 'slideIn 0.3s ease-out forwards' : 'none'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(150%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='font-bold text-gray-900 md:text-lg dark:text-gray-100'>
          {title}
        </h3>
        <button
          onClick={handleDismiss}
          className='text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
          aria-label='Quitar'
        >
          <X size={20} />
        </button>
      </div>
      <p className='mb-4 hidden text-sm text-gray-600 md:block dark:text-gray-300'>
        {description}
      </p>
      <div className='flex flex-col gap-2'>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90'
          style={{ backgroundColor: isWhatsapp ? '#25D366' : '#1877F2' }}
        >
          <span className='mr-2 flex items-center text-white'>
            <Icon
              network={iconNetwork}
              width='w-4'
              size={isWhatsapp ? '26 26' : undefined}
            />
          </span>
          {buttonText}
        </a>
      </div>
    </div>
  )
}

export { SocialBanners }
