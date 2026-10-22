'use client'

import { useState, type SyntheticEvent } from 'react'
import { toast } from 'sonner'
import { isProd } from '@lib/utils'
import { TurnstileWidget } from '@components/auth/TurnstileWidget'

export default function ContactForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const formData = new FormData(form)
    const token = isProd ? window.turnstile?.getResponse() : undefined

    if (isProd && !token) {
      toast.error('Por favor verifica que no eres un robot.')
      return
    }

    setPending(true)
    try {
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
      if (!res.ok) {
        toast.error(data.message || 'Ocurrió un error al enviar el mensaje.')
        return
      }
      toast.success(data.message)
      form.reset()
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      // A verification token can only be used once, including rejected submissions.
      setPending(false)
      const widget = form.querySelector<HTMLElement>('.cf-turnstile')
      if (isProd && widget) window.turnstile?.reset(widget)
    }
  }

  return (
    <main className='max-w-xl'>
      <h1 className='mb-4 font-sans text-3xl md:text-4xl dark:text-neutral-300'>
        Contáctanos
      </h1>
      <form
        onSubmit={event => void handleSubmit(event)}
        className='space-y-4 rounded-xl border p-6 shadow-xl'
      >
        <div>
          <label
            htmlFor='contact-name'
            className='mb-1 block text-sm dark:text-neutral-300'
          >
            Nombre
          </label>
          <input
            id='contact-name'
            name='name'
            type='text'
            required
            className='w-full rounded-md border px-3 py-2 dark:bg-neutral-800 dark:text-neutral-300'
          />
        </div>
        <div>
          <label
            htmlFor='contact-email'
            className='mb-1 block text-sm dark:text-neutral-300'
          >
            Email
          </label>
          <input
            id='contact-email'
            name='email'
            type='email'
            required
            className='w-full rounded-md border px-3 py-2 dark:bg-neutral-800 dark:text-neutral-300'
          />
        </div>
        <div>
          <label
            htmlFor='contact-subject'
            className='mb-1 block text-sm dark:text-neutral-300'
          >
            Asunto
          </label>
          <select
            id='contact-subject'
            name='subject'
            required
            className='w-full rounded-md border px-3 py-2 dark:bg-neutral-800 dark:text-neutral-300'
          >
            <option value=''>Selecciona un asunto</option>
            <option value='denuncias'>Denuncias</option>
            <option value='avisos-legales'>Avisos Legales</option>
            <option value='notas-de-prensa'>Notas de Prensa</option>
            <option value='notas-patrocinadas'>Notas Patrocinadas</option>
            <option value='publicidad'>Publicidad</option>
            <option value='otro'>Otro</option>
          </select>
        </div>
        <div>
          <label
            htmlFor='contact-message'
            className='mb-1 block text-sm dark:text-neutral-300'
          >
            Mensaje
          </label>
          <textarea
            id='contact-message'
            name='message'
            required
            rows={3}
            className='w-full rounded-md border px-3 py-2 dark:bg-neutral-800 dark:text-neutral-300'
          />
        </div>
        {isProd && <TurnstileWidget />}
        <button type='submit' disabled={pending} className='button'>
          {pending ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </main>
  )
}
