'use client'

import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel
} from '@components/ui/alert-dialog'
import { SOCIAL_LINKS } from '@lib/constants'
import { X } from 'lucide-react'
import { Icon } from '@components/Icon'

const FACEBOOK_DIALOG_KEY = 'facebookDialogShown'
const WHATSAPP_DIALOG_KEY = 'whatsappDialogShown'

const WhatsappDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(WHATSAPP_DIALOG_KEY, 'true')
  }

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(true)
    }

    window.addEventListener('scroll', handleScroll, { once: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const facebookDialogShown = localStorage.getItem(FACEBOOK_DIALOG_KEY)
      const whatsappDialogShown = localStorage.getItem(WHATSAPP_DIALOG_KEY)
      if (hasScrolled && facebookDialogShown && !whatsappDialogShown) {
        setIsOpen(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [hasScrolled])

  const { link } = SOCIAL_LINKS.find(item => item.id === 'whatsapp') ?? {
    link: ''
  }

  if (!link) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡No te pierdas de nada!</AlertDialogTitle>
        </AlertDialogHeader>
        <button
          title='Cerrar'
          onClick={handleClose}
          className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm border opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'
        >
          <X className='h-6 w-6' />
          <span className='sr-only'>Close</span>
        </button>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-muted-foreground mb-4 text-center text-sm'>
            Recibe las noticias más importantes del día directamente en tu
            celular.
          </p>
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex w-full items-center justify-center rounded-md bg-[#25D366] px-4 py-2 font-bold text-white transition-colors hover:bg-[#128C7E]'
          >
            <Icon network='whatsapp' width='w-6 h-6 mr-2' size='25 25' />
            Unirme ahora
          </a>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { WhatsappDialog }
