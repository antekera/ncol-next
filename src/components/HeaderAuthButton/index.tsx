'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { getThemeSwitchClassName } from '@components/Header/styles'
import { useLoginModal } from '@components/auth/LoginModalContext'
import { createClient } from '@lib/supabase/client'

type Props = {
  isHeaderPrimary?: boolean
}

export const HeaderAuthButton = ({ isHeaderPrimary }: Props) => {
  const { openLoginModal } = useLoginModal()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const baseClassName = getThemeSwitchClassName({ isHeaderPrimary })

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setIsLoggedIn(Boolean(data.user))
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoggedIn) return null

  return (
    <button
      data-onboarding-target='login-icon'
      onClick={() => openLoginModal()}
      className={baseClassName}
      aria-label='Iniciar sesión'
    >
      <User className='h-5 w-5' />
    </button>
  )
}
