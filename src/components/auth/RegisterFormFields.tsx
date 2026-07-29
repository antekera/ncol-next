'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import { cn } from '@lib/shared'
import { createClient } from '@lib/supabase/client'
import { registerSchema, type RegisterFormValues } from '@lib/schemas/auth'
import { translateRegisterError } from '@lib/authErrors'
import { TurnstileWidget, verifyTurnstileToken } from '@components/auth/TurnstileWidget'
import { isProd } from '@lib/utils/env'
import { subscribe } from '@app/actions/subscribe'

type Props = {
  onSwitchToLogin: () => void
}

export function RegisterFormFields({ onSwitchToLogin }: Props) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      newsletter: false
    }
  })

  useEffect(() => {
    return () => reset()
  }, [reset])

  const onRegister = async (values: RegisterFormValues) => {
    setSubmittedEmail(values.email)
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: `${values.firstName} ${values.lastName}`.trim()
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (signUpError) {
      setError(translateRegisterError(signUpError.message))
      setIsLoading(false)
      return
    }

    if (data.user && values.newsletter) {
      const formData = new FormData()
      formData.set('email', values.email)
      await subscribe(undefined, formData)
    }

    setIsLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className='px-6 pb-6 text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-100 text-green-600'>
          <CheckCircle2 className='h-9 w-9' />
        </div>
        <p className='mb-6 text-sm text-slate-600 dark:text-neutral-300'>
          Hemos enviado un correo de confirmación a{' '}
          <strong>{submittedEmail}</strong>. Revisa tu bandeja de entrada para
          verificar tu cuenta. Si no lo encuentras, revisa también la carpeta
          de spam o correo no deseado.
        </p>
        <Button
          type='button'
          onClick={onSwitchToLogin}
          className='h-12 w-full bg-[var(--color-dark-blue)] text-base font-bold text-white hover:opacity-90'
        >
          Ir al inicio de sesión
        </Button>
      </div>
    )
  }

  return (
    <form
      className='grid grid-cols-1 gap-5 px-6 pb-6 md:grid-cols-2'
      onSubmit={e => {
        void handleSubmit(onRegister)(e)
      }}
    >
      {error && (
        <div className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2'>
          <AlertCircle className='h-5 w-5 shrink-0' />
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor='register-modal-first-name'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Nombre
        </label>
        <div className='relative'>
          <input
            id='register-modal-first-name'
            placeholder='Tu nombre'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.firstName && 'border-red-500'
            )}
            {...register('firstName')}
          />
          <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
        </div>
        {errors.firstName && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor='register-modal-last-name'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Apellidos
        </label>
        <div className='relative'>
          <input
            id='register-modal-last-name'
            placeholder='Tu apellido'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.lastName && 'border-red-500'
            )}
            {...register('lastName')}
          />
          <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
        </div>
        {errors.lastName && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div className='md:col-span-2'>
        <label
          htmlFor='register-modal-email'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Email
        </label>
        <div className='relative'>
          <input
            id='register-modal-email'
            placeholder='tu@email.com'
            type='email'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.email && 'border-red-500'
            )}
            {...register('email')}
          />
          <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
        </div>
        {errors.email && (
          <p className='mt-1 text-[10px] text-red-500'>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='register-modal-password'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Contraseña
        </label>
        <div className='relative'>
          <input
            id='register-modal-password'
            placeholder='Min. 8 caracteres'
            type='password'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.password && 'border-red-500'
            )}
            {...register('password')}
          />
          <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400' />
        </div>
        {errors.password && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor='register-modal-confirm-password'
          className='mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase'
        >
          Confirmar contraseña
        </label>
        <div className='relative'>
          <input
            id='register-modal-confirm-password'
            placeholder='Repite la contraseña'
            type='password'
            className={cn(
              'h-12 w-full rounded-md border border-slate-200 pl-10 text-sm focus:border-[var(--color-dark-blue)] focus:ring-1 focus:ring-[var(--color-dark-blue)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800',
              errors.confirmPassword && 'border-red-500'
            )}
            {...register('confirmPassword')}
          />
          <CheckCircle2
            className={cn(
              'absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400',
              errors.confirmPassword && 'text-red-500'
            )}
          />
        </div>
        {errors.confirmPassword && (
          <p className='mt-1 text-[10px] text-red-500'>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className='md:col-span-2'>
        <div className='flex items-start gap-2'>
          <Checkbox
            id='register-modal-terms'
            onCheckedChange={checked => setValue('terms', Boolean(checked))}
            className='mt-0.5'
          />
          <label
            htmlFor='register-modal-terms'
            className='cursor-pointer text-sm leading-tight text-slate-500 select-none dark:text-neutral-400'
          >
            Acepto los{' '}
            <Link
              href='/terminos-y-condiciones'
              target='_blank'
              className='font-bold text-[var(--color-dark-blue)] hover:underline'
            >
              Términos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link
              href='/privacidad'
              target='_blank'
              className='font-bold text-[var(--color-dark-blue)] hover:underline'
            >
              Política de Privacidad
            </Link>{' '}
            de NoticiasCol.
          </label>
        </div>
        {errors.terms && (
          <p className='mt-1 text-[10px] text-red-500'>{errors.terms.message}</p>
        )}

        <div className='mt-3 flex items-start gap-2'>
          <Checkbox
            id='register-modal-newsletter'
            onCheckedChange={checked =>
              setValue('newsletter', Boolean(checked))
            }
            className='mt-0.5'
          />
          <label
            htmlFor='register-modal-newsletter'
            className='cursor-pointer text-sm leading-tight text-slate-500 select-none dark:text-neutral-400'
          >
            Quiero recibir noticias destacadas de NoticiasCol en mi correo.
          </label>
        </div>
      </div>

      <div className='md:col-span-2'>
        <TurnstileWidget />
      </div>

      <div className='md:col-span-2'>
        <Button
          type='submit'
          disabled={isLoading}
          className='flex h-12 w-full items-center justify-center gap-2 bg-[var(--color-dark-blue)] text-base font-bold text-white hover:opacity-90'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin' />
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </Button>
      </div>

      <p className='text-center text-sm text-slate-500 md:col-span-2'>
        ¿Ya tienes una cuenta?{' '}
        <button
          type='button'
          onClick={onSwitchToLogin}
          className='font-bold text-[var(--color-dark-blue)] hover:underline'
        >
          Inicia sesión aquí
        </button>
      </p>
    </form>
  )
}
