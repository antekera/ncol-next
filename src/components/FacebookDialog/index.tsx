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
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { Icon } from '@components/Icon'

const FACEBOOK_DIALOG_KEY = 'facebookDialogShown'

const FacebookDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const isMobile = useIsMobile()

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(FACEBOOK_DIALOG_KEY, 'true')
    sessionStorage.setItem('facebookDialogSession', 'true')
  }

  const useFacebookLink = pageId => {
    const [userAgent, setUserAgent] = useState('')

    useEffect(() => {
      setUserAgent(navigator.userAgent)
    }, [])

    if (/Android/i.test(userAgent)) {
      return `intent://profile/${pageId}#Intent;package=com.facebook.katana;scheme=fb;launchFlags=0x8080000;S.browser_fallback_url=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D${pageId};end`
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return `fb://profile/${pageId}`
    } else {
      return `https://www.facebook.com/profile.php?id=${pageId}`
    }
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
          title-='Cerrar'
          onClick={handleClose}
          className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm border opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'
        >
          <X className='h-6 w-6' />
          <span className='sr-only'>Close</span>
        </button>
        {isMobile ? (
          <div className='flex flex-col items-center justify-center p-6'>
            <a
              href={facebookUrl}
              className='flex w-full items-center justify-center rounded-md bg-[#4267b2] px-4 py-2 font-bold text-white transition-colors hover:bg-[#3b5998]'
            >
              <Icon network='facebook' width='w-6 h-6 mr-2' />
              Seguir en Facebook
            </a>
          </div>
        ) : null}
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
