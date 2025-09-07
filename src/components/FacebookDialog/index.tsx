'use client'

import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from '@components/ui/alert-dialog'
import { Page } from 'react-facebook'
import { SOCIAL_LINKS } from '@lib/constants'
import { X } from 'lucide-react'
import { Icon } from '@components/Icon'

const FACEBOOK_DIALOG_KEY = 'facebookDialogShown'

const useFacebookLink = (pageId: string) => {
  const [userAgent, setUserAgent] = useState('')

  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [])

  if (/Android/i.test(userAgent)) {
    return `https://m.facebook.com/profile.php?id=${pageId}`
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return `fb://profile/${pageId}`
  } else {
    return `https://www.facebook.com/profile.php?id=${pageId}`
  }
}

const FacebookDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(FACEBOOK_DIALOG_KEY, 'true')
    sessionStorage.setItem('facebookDialogSession', 'true')
  }

  const facebookUrl = useFacebookLink('591039867427307')

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
      const dialogShown = localStorage.getItem(FACEBOOK_DIALOG_KEY)
      if (hasScrolled && !dialogShown) {
        setIsOpen(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [hasScrolled])

  const { link } = SOCIAL_LINKS.find(item => item.id === 'facebook') ?? {
    link: ''
  }

  if (!link) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Recibe noticias en Facebook</AlertDialogTitle>
        </AlertDialogHeader>
        <button
          title='Cerrar'
          onClick={handleClose}
          className='ring-offset-background align-center focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 flex rounded-sm border opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'
        >
          <span className='pt-0.5 text-xs'>Cerrar</span>
          <X className='h-5 w-5' />
        </button>
        <div className='flex flex-col items-center justify-center p-6'>
          <a
            href={facebookUrl}
            className='flex w-full items-center justify-center rounded-md bg-[#4267b2] px-4 py-2 font-bold text-white transition-colors hover:bg-[#3b5998]'
          >
            <Icon network='facebook' width='w-6 h-6 mr-2' />
            Seguir en Facebook
          </a>
        </div>
        <Page
          href={link}
          height={250}
          showFacepile
          adaptContainerWidth
          smallHeader
          lazy
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { FacebookDialog }
