'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { LoginModal } from '@components/auth/LoginModal'

type LoginModalContextValue = {
  openLoginModal: (onSuccess?: () => void | Promise<void>) => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [onSuccess, setOnSuccess] = useState<
    (() => void | Promise<void>) | undefined
  >(undefined)

  const openLoginModal = useCallback(
    (callback?: () => void | Promise<void>) => {
      setOnSuccess(() => callback)
      setIsOpen(true)
    },
    []
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) setOnSuccess(undefined)
  }, [])

  // Header/tag icons read the session once on mount (client components,
  // no shared reactive auth store across their separate Supabase client
  // instances), so a same-tab login wouldn't otherwise update them. A
  // full reload is the simplest reliable fix — wait for any pending
  // action (e.g. completing a tag subscribe) to finish first so it isn't
  // cut short by the navigation.
  const handleSuccess = useCallback(async () => {
    setIsOpen(false)
    await onSuccess?.()
    setOnSuccess(undefined)
    window.location.reload()
  }, [onSuccess])

  const value = useMemo(() => ({ openLoginModal }), [openLoginModal])

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSuccess={() => {
          void handleSuccess()
        }}
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
