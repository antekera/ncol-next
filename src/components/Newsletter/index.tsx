'use client'

import { useState, useActionState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

import { Mail } from 'lucide-react'

import { subscribe } from '@app/actions/subscribe'
import { cn } from '@lib/shared'

const Status = {
  Error: 'error',
  Success: 'success'
}

const initialState = {
  message: '',
  type: ''
}

const Newsletter = ({ className }: { className?: string }) => {
  const [state, formAction] = useActionState(subscribe, initialState)

  const classes = cn(
    'mb-8 rounded-lg bg-slate-100 p-4 font-sans md:mb-4',
    className
  )
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (state.type === Status.Success) {
      setEmail('')
    }
  }, [state.type])

  return (
    <div className={classes}>
      <form action={formAction}>
        <label
          htmlFor='email-input'
          className='mb-0 pt-1 font-sans_bold text-lg'
        >
          Únete a nuestro boletín
        </label>
        <p className='text-sm leading-snug'>
          Recibe grátis las noticias más destacadas en tu correo.
        </p>
        <div className='mt-2 flex flex-col'>
          <div className='w-full'>
            <input
              autoCapitalize='off'
              autoCorrect='off'
              id='email-input'
              name='email'
              type='email'
              className='shadow-sm focus:darkBlue mb-2 block w-full rounded-md border border-darkBlue/20 px-3 py-1 text-sm focus:ring-opacity-50 md:w-11/12'
              placeholder='tu.correo@mail.com'
              required
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
              value={email}
            />
          </div>
          <div className='w-1/5 md:w-full'>
            <button
              className={`focus:shadow-outline flex gap-2 rounded-lg border bg-primary px-2 py-1 text-sm text-white transition-colors duration-150 hover:bg-darkBlue/80 md:px-3`}
            >
              <Mail size='20' />
              Suscribirme
            </button>
          </div>
        </div>
      </form>
      {state.type === Status.Error && (
        <div className='error-state mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs leading-tight'>
          {state.message}
        </div>
      )}
      {state.type === Status.Success && (
        <div className='error-state mt-3 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs leading-tight'>
          {state.message}
        </div>
      )}
    </div>
  )
}

export { Newsletter }
