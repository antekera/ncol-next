'use client'

import { useEffect, useState } from 'react'
import { User, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@components/ui/dialog'
import { LoginFormFields } from '@components/auth/LoginFormFields'
import { RegisterFormFields } from '@components/auth/RegisterFormFields'

type Mode = 'login' | 'register'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LoginModal({ open, onOpenChange, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login')

  useEffect(() => {
    if (!open) setMode('login')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className='relative bg-[var(--color-dark-blue)] p-6 text-white'>
          {mode === 'login' ? (
            <>
              <DialogTitle className='flex items-center gap-2 text-xl font-bold text-white'>
                <User className='h-5 w-5' />
                Inicia sesión
              </DialogTitle>
              <DialogDescription className='mt-1 text-sm text-slate-300'>
                Ingresa tu correo electrónico y contraseña para activar tus
                suscripciones a temas
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className='flex items-center gap-2 text-xl font-bold text-white'>
                <UserPlus className='h-5 w-5' />
                Crear cuenta
              </DialogTitle>
              <DialogDescription className='mt-1 text-sm text-slate-300'>
                Regístrate para suscribirte a los temas que te interesan
              </DialogDescription>
            </>
          )}
        </div>

        {mode === 'login' ? (
          <LoginFormFields
            onSuccess={onSuccess}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterFormFields onSwitchToLogin={() => setMode('login')} />
        )}
      </DialogContent>
    </Dialog>
  )
}
