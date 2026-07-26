'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LoginModal } from '@components/auth/LoginModal'

type LoginModalContextValue = {
  openLoginModal: (onSuccess?: () => void) => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(
    undefined
  )

  const openLoginModal = useCallback((callback?: () => void) => {
    setOnSuccess(() => callback)
    setIsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) setOnSuccess(undefined)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsOpen(false)
    onSuccess?.()
    setOnSuccess(undefined)
  }, [onSuccess])

  const value = useMemo(() => ({ openLoginModal }), [openLoginModal])

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    </LoginModalContext.Provider>
  )
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext)
  if (!ctx) {
    throw new Error('useLoginModal must be used within a LoginModalProvider')
  }
  return ctx
}
