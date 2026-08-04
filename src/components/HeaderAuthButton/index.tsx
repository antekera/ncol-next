'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { getThemeSwitchClassName } from '@components/Header/styles'
import { useLoginModal } from '@components/auth/LoginModalContext'
import { createClient } from '@lib/supabase/client'
import { GA_EVENTS, PROFILE_PATH } from '@lib/constants'
import { GAEvent } from '@lib/utils'

type Props = {
  isHeaderPrimary?: boolean
}

export const HeaderAuthButton = ({ isHeaderPrimary }: Props) => {
  const { openLoginModal } = useLoginModal()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const baseClassName = getThemeSwitchClassName({ isHeaderPrimary })

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user))
    })
    return () => subscription.unsubscribe()
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
      onClick={() => {
        GAEvent({
          category: GA_EVENTS.LOGIN_ICON.CATEGORY,
          label: GA_EVENTS.LOGIN_ICON.LABEL
        })
        openLoginModal()
      }}
      className={baseClassName}
      aria-label='Iniciar sesión'
    >
      <User />
    </button>
  )
}
