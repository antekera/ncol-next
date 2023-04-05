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

  const classes = cn('p-4 mb-8 rounded-lg md:mb-4 bg-slate-100', className)
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
          className='pt-1 mb-0 text-lg font-sans_bold'
        >
          Únete a nuestro boletín
        </label>
        <p className='text-sm leading-snug'>
          Recibe grátis las noticias más destacadas en tu correo.
        </p>
        <div className='flex mt-2 md:block gap-2 md:gap-0'>
          <div className='w-3/5 md:w-full'>
            <input
              autoCapitalize='off'
              autoCorrect='off'
              id='email-input'
              name='email'
              type='email'
              className='block w-full px-3 py-1 mb-2 text-sm border md:w-11/12 border-darkBlue/20 rounded-md shadow-sm focus:darkBlue focus:ring-opacity-50'
              placeholder='tu.correo@mail.com'
              onChange={changeValue}
              value={email}
            />
          </div>
          <div className='w-1/5 md:w-full'>
            <button
              type='submit'
              disabled={isDisabled}
              className={`flex px-2 md:px-3 py-1 text-sm border text-white rounded-lg gap-2 transition-colors duration-150 focus:shadow-outline ${
                isDisabled
                  ? 'bg-darkBlue/50 pointer cursor-not-allowed'
                  : 'bg-primary hover:bg-darkBlue/80'
              }`}
            >
              <span className='relative block h-4 !leading-none !text-lg material-symbols-rounded'>
                {icon[status]}
              </span>
              Suscribirme
            </button>
          </div>
        </div>
      </form>
      {status === Status.Error && errorMsg && (
        <div className='px-3 py-2 mt-3 text-xs leading-tight border border-red-300 rounded-lg bg-red-50 error-state'>
          {errorMsg}
        </div>
      )}
      {status === Status.Success && errorMsg && (
        <div className='px-3 py-2 mt-3 text-xs leading-tight border border-green-300 rounded-lg bg-green-50 error-state'>
          {errorMsg}
        </div>
      )}
    </div>
  )
}

export { Newsletter }
