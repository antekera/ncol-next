'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
    <button type='submit' disabled={pending} className='button'>
      {pending ? 'Enviando...' : 'Enviar mensaje'}
    </button>
  )
}

export default function ContactForm() {
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
    toast.success(data.message)
  }

  return (
    <main className='contact-form'>
      <h1 className='contact-form-title'>Contáctanos</h1>
      <form action={handleSubmit} className='contact-form-form'>
        <div>
          <label htmlFor='contact-name' className='contact-form-label'>
            Nombre
          </label>
          <input
            id='contact-name'
            name='name'
            type='text'
            required
            className='contact-form-input'
          />
        </div>
        <div>
          <label htmlFor='contact-email' className='contact-form-label'>
            Email
          </label>
          <input
            id='contact-email'
            name='email'
            type='email'
            required
            className='contact-form-input'
          />
        </div>
        <div>
          <label htmlFor='contact-subject' className='contact-form-label'>
            Asunto
          </label>
          <select
            id='contact-subject'
            name='subject'
            required
            className='contact-form-input'
          >
            <option value=''>Selecciona un asunto</option>
            <option value='notas-de-prensa'>Notas de Prensa</option>
            <option value='notas-patrocinadas'>Notas Patrocinadas</option>
            <option value='publicidad'>Publicidad</option>
            <option value='otro'>Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor='contact-message' className='contact-form-label'>
            Mensaje
          </label>
          <textarea
            id='contact-message'
            name='message'
            required
            rows={3}
            className='contact-form-input'
          />
        </div>
        {isProd && <TurnstileWidget />}
        <SubmitButton />
      </form>
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