'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { Button } from '@components/ui/button'
import { cn } from '@lib/shared'
import { createClient } from '@lib/supabase/client'
import { loginSchema, type LoginFormValues } from '@lib/schemas/auth'
import { translateLoginError } from '@lib/authErrors'
import { GoogleSignInButton } from '@components/auth/GoogleSignInButton'
import {
  TurnstileWidget,
  verifyTurnstileToken
} from '@components/auth/TurnstileWidget'
import { isProd } from '@lib/utils/env'

type Props = {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginFormFields({ onSuccess, onSwitchToRegister }: Props) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  useEffect(() => {
    return () => reset()
  }, [reset])

  const onLogin = async (values: LoginFormValues) => {
    setError(null)
    setIsLoading(true)

    if (isProd) {
      const verified = await verifyTurnstileToken()
      if (!verified) {
        setError('Por favor completa la verificación de seguridad.')
        setIsLoading(false)
        return
      }
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })

    if (loginError) {
      setError(translateLoginError(loginError.message))
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onSuccess()
  }

  return (
    <form
      className='space-y-5 px-6 pb-6'
      onSubmit={e => {
        void handleSubmit(onLogin)(e)
      }}
    >
      {error && (
        <div className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          <AlertCircle className='h-5 w-5 shrink-0' />
          {error}
        </div>
      )}

      <div className='space-y-3'>
        <GoogleSignInButton text='Iniciar sesión con Google' />
      </div>

      <div className='relative flex items-center py-1'>
        <div className='flex-grow border-t border-slate-200 dark:border-neutral-700' />
        <span className='mx-4 shrink-0 text-xs font-medium text-slate-400 uppercase'>
          o
        </span>
        <div className='flex-grow border-t border-slate-200 dark:border-neutral-700' />
      </div>

      <div>
        <label
          htmlFor='login-modal-email'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Email
        </label>
        <div className='relative'>
          <input
            id='login-modal-email'
            placeholder='Ingrese su email'
            type='email'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.email && 'border-red-500'
            )}
            {...register('email')}
          />
          <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
        </div>
        {errors.email && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor='login-modal-password'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Contraseña
        </label>
        <div className='relative'>
          <input
            id='login-modal-password'
            placeholder='Ingrese su contraseña'
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pr-10 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.password && 'border-red-500'
            )}
            {...register('password')}
          />
          <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600'
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
        {errors.password && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.password.message}
          </p>
        )}
      </div>

      <TurnstileWidget />

      <Button
        type='submit'
        disabled={isLoading}
        className='flex h-12 w-full items-center justify-center gap-2 bg-[var(--color-dark-blue)] text-base font-bold text-white hover:opacity-90'
      >
        {isLoading ? (
          <>
            <Loader2 className='h-5 w-5 animate-spin' />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>

      <p className='text-center text-sm text-slate-500'>
        ¿No tienes cuenta?{' '}
        <button
          type='button'
          onClick={onSwitchToRegister}
          className='font-bold text-[var(--color-dark-blue)] hover:underline'
        >
          Regístrate aquí
        </button>
      </p>
    </form>
  )
}
