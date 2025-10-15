'use client'

import { Mail, MailCheck, MailX } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useActionState, useEffect, useState } from 'react'
import { subscribe } from '@app/actions/subscribe'
import { STATUS } from '@lib/constants'
import { cn } from '@lib/shared'

const initialState = {
  message: '',
  type: ''
}

const Newsletter = ({ className }: { className?: string }) => {
  const [state, formAction] = useActionState(subscribe, initialState)

  const [email, setEmail] = useState('')

  useEffect(() => {
    if (state.type === STATUS.Success) {
      setEmail('')
    }
  }, [state.type])

  return (
    <div className={cn('newsletter', className)}>
      <form action={formAction}>
        <label htmlFor='email-input' className='newsletter-label'>
          Suscríbete a nuestro boletín
        </label>
        <p className='newsletter-description'>
          Recibe grátis las noticias más destacadas en tu correo.
        </p>
        <div className='newsletter-input-wrapper'>
          <div className='newsletter-input-container'>
            <input
              autoCapitalize='off'
              autoCorrect='off'
              id='email-input'
              name='email'
              type='email'
              className='newsletter-input'
              placeholder='tu.correo@mail.com'
              required
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
              value={email}
            />
          </div>
          <div className='newsletter-button-wrapper'>
            <button className='button focus:shadow-outline'>
              {state.type === STATUS.Error && <MailX size='20' />}
              {state.type === STATUS.Success && <MailCheck size='20' />}
              {!state.type && <Mail size='20' />}
              Suscribirme
            </button>
          </div>
        </div>
      </form>
      {state.type === STATUS.Error && (
        <div className='newsletter-error-state'>{state.message}</div>
      )}
      {state.type === STATUS.Success && (
        <div className='newsletter-success-state'>{state.message}</div>
      )}
    </div>
  )
}

export { Newsletter }