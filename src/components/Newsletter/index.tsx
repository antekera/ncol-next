import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import cn from 'classnames'

import { REGEX_VALID_EMAIL } from '@lib/constants'

enum Status {
  Error = 'error',
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success'
}
const errorMessage =
  'Hubo un error al intentar suscribirte, por favor intenta de nuevo.'
const successMessage =
  '¡Gracias por suscribirte! Te enviaremos un correo electrónico de confirmación.'
const icon = {
  [Status.Error]: 'mail',
  [Status.Idle]: 'mail',
  [Status.Loading]: 'forward_to_inbox',
  [Status.Success]: 'mark_email_read'
}

const Newsletter = ({ className }: { className?: string }) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(Status.Idle)
  const [errorMsg, setErrorMsg] = useState('')

  const classes = cn(
    'mb-8 rounded-lg bg-slate-100 p-4 font-sans md:mb-4',
    className
  )
  const isDisabled = !REGEX_VALID_EMAIL.test(email) || email === ''

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(Status.Loading)

    const options = {
      body: JSON.stringify({
        email: email
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }
    const url = '/api/subscribe'

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        setStatus(Status.Success)
        setEmail('')
        setErrorMsg(successMessage)
      } else {
        setStatus(Status.Error)
        setStatus(Status.Error)
        setErrorMsg(errorMessage)
      }
    } catch (error) {
      setErrorMsg(errorMessage)
      setStatus(Status.Error)
      setEmail('')
    }
  }

  const changeValue = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setEmail(target.value)
    setErrorMsg('')
  }

  return (
    <div className={classes}>
      <form method='POST' onSubmit={subscribe}>
        <label
          htmlFor='email-input'
          className='mb-0 pt-1 font-sans_bold text-lg'
        >
          Únete a nuestro boletín
        </label>
        <p className='text-sm leading-snug'>
          Recibe grátis las noticias más destacadas en tu correo.
        </p>
        <div className='mt-2 flex gap-2 md:block md:gap-0'>
          <div className='w-3/5 md:w-full'>
            <input
              autoCapitalize='off'
              autoCorrect='off'
              id='email-input'
              name='email'
              type='email'
              className='shadow-sm focus:darkBlue mb-2 block w-full rounded-md border border-darkBlue/20 px-3 py-1 text-sm focus:ring-opacity-50 md:w-11/12'
              placeholder='tu.correo@mail.com'
              onChange={changeValue}
              value={email}
            />
          </div>
          <div className='w-1/5 md:w-full'>
            <button
              type='submit'
              disabled={isDisabled}
              className={`focus:shadow-outline flex gap-2 rounded-lg border px-2 py-1 text-sm text-white transition-colors duration-150 md:px-3 ${
                isDisabled
                  ? 'pointer cursor-not-allowed bg-darkBlue/50'
                  : 'bg-primary hover:bg-darkBlue/80'
              }`}
            >
              <span className='material-symbols-rounded relative block h-4 !text-lg !leading-none'>
                {icon[status]}
              </span>
              Suscribirme
            </button>
          </div>
        </div>
      </form>
      {status === Status.Error && errorMsg && (
        <div className='error-state mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs leading-tight'>
          {errorMsg}
        </div>
      )}
      {status === Status.Success && errorMsg && (
        <div className='error-state mt-3 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs leading-tight'>
          {errorMsg}
        </div>
      )}
    </div>
  )
}

export { Newsletter }
