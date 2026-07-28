'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { getThemeSwitchClassName } from '@components/Header/styles'
import { useLoginModal } from '@components/auth/LoginModalContext'
import { createClient } from '@lib/supabase/client'
import { PROFILE_PATH } from '@lib/constants'

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

  if (isLoggedIn) {
    return (
      <Link
        data-onboarding-target='login-icon'
        href={PROFILE_PATH}
        className={baseClassName}
        aria-label='Mi perfil'
      >
        <User />
      </Link>
    )
  }

  return (
    <button
      data-onboarding-target='login-icon'
      onClick={() => openLoginModal()}
      className={baseClassName}
      aria-label='Iniciar sesión'
    >
      <User />
    </button>
  )
}
