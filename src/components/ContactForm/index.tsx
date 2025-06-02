'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { useEffect } from 'react'

import { useRef } from 'react'
import { isProd } from '@lib/utils'

const TurnstileWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && window.turnstile && widgetRef.current) {
      window.turnstile.render(widgetRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
      })
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      ref={widgetRef}
      id='turnstile-widget'
      className='cf-turnstile my-4'
      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50'
    >
      {pending ? 'Enviando...' : 'Enviar mensaje'}
    </button>
  )
}

export default function ContactForm() {
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    const token = isProd ? window.turnstile?.getResponse() : undefined

    const res = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        ...(isProd && { token })
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await res.json()
    setMessage(data.message)
  }

  return (
    <main className='max-w-xl'>
      <h1 className='mb-4 text-3xl font-bold'>Contáctanos</h1>
      <form
        action={handleSubmit}
        className='space-y-4 rounded-xl border bg-white p-6 shadow-xl'
      >
        <div>
          <label htmlFor='contact-name' className='mb-1 block text-sm'>
            Nombre
          </label>
          <input
            id='contact-name'
            name='name'
            type='text'
            required
            className='w-full rounded-md border px-3 py-2'
          />
        </div>
        <div>
          <label htmlFor='contact-email' className='mb-1 block text-sm'>
            Email
          </label>
          <input
            id='contact-email'
            name='email'
            type='email'
            required
            className='w-full rounded-md border px-3 py-2'
          />
        </div>
        <div>
          <label htmlFor='contact-subject' className='mb-1 block text-sm'>
            Asunto
          </label>
          <select
            id='contact-subject'
            name='subject'
            required
            className='w-full rounded-md border px-3 py-2'
          >
            <option value=''>Selecciona un asunto</option>
            <option value='notas-de-prensa'>Notas de Prensa</option>
            <option value='notas-patrocinadas'>Notas Patrocinadas</option>
            <option value='publicidad'>Publicidad</option>
            <option value='otro'>Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor='contact-message' className='mb-1 block text-sm'>
            Mensaje
          </label>
          <textarea
            id='contact-message'
            name='message'
            required
            rows={3}
            className='w-full rounded-md border px-3 py-2'
          />
        </div>
        {isProd && <TurnstileWidget />}
        <SubmitButton />
      </form>
      {message && (
        <p className='mt-4 text-center font-medium text-green-600'>{message}</p>
      )}
      {isProd && (
        <script
          src='https://challenges.cloudflare.com/turnstile/v0/api.js'
          async
          defer
        />
      )}
    </main>
  )
}
