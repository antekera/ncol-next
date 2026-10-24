'use client'

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

const LoginModal = lazy(() =>
  import('@components/auth/LoginModal').then(module => ({
    default: module.LoginModal
  }))
)

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
  const returnFocus = useRef<HTMLElement | null>(null)
  const [onSuccess, setOnSuccess] = useState<
    (() => void | Promise<void>) | undefined
  >(undefined)

  const openLoginModal = useCallback(
    (callback?: () => void | Promise<void>) => {
      returnFocus.current ??=
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      setOnSuccess(() => callback)
      setIsOpen(true)
    },
    []
  )

  // The dialog is opened outside Radix's DialogTrigger. Restore keyboard focus
  // after unmount, including cancellation before the form has downloaded.
  useEffect(() => {
    if (isOpen) return
    const target = returnFocus.current
    returnFocus.current = null
    if (target?.isConnected) target.focus({ preventScroll: true })
  }, [isOpen])

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
      {isOpen && (
        <Suspense
          fallback={
            <div
              role='status'
              data-home-occluder='login-loading'
              className='fixed inset-x-4 top-4 z-50 flex items-center justify-between gap-4 rounded bg-white p-4 text-slate-900 shadow-lg'
            >
              <span>Cargando acceso…</span>
              <button onClick={() => handleOpenChange(false)}>Cancelar</button>
            </div>
          }
        >
          <LoginModal
            open={isOpen}
            onOpenChange={handleOpenChange}
            onSuccess={() => {
              void handleSuccess()
            }}
          />
        </Suspense>
      )}
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
