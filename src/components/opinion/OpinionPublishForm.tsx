'use client'

import { useRef, useState } from 'react'
import { Bold, Italic, Link, List, ListOrdered, Quote } from 'lucide-react'

import { Button } from '@components/ui/button'

const TERMS_VERSION = '2026-07-01'

type Props = {
  token: string
}

export default function OpinionPublishForm({ token }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  const format = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const addLink = () => {
    const url = window.prompt('URL del enlace')
    if (url) format('createLink', url)
  }

  const submit = async () => {
    const content = editorRef.current?.innerHTML ?? ''
    if (!window.confirm('El artículo se publicará inmediatamente y no podrás editarlo desde este portal. ¿Continuar?')) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/opinion/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title,
          content,
          acceptedTerms,
          termsVersion: TERMS_VERSION
        })
      })
      const result = await response.json()

      if (!response.ok) {
        setMessage(result.message ?? 'No se pudo publicar el artículo.')
        return
      }

      setPublishedUrl(result.post.url)
      setMessage('El artículo fue publicado correctamente.')
      setTitle('')
      if (editorRef.current) editorRef.current.innerHTML = ''
      setAcceptedTerms(false)
    } catch {
      setMessage('No se pudo conectar con el servicio de publicación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto max-w-3xl space-y-6 rounded-xl border bg-background p-5 shadow-sm md:p-8'>
      <div>
        <p className='text-sm font-semibold uppercase tracking-wide text-primary'>Opinión</p>
        <h1 className='mt-1 text-3xl font-bold'>Publicar un artículo</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          El artículo se publicará inmediatamente en NoticiasCol. En este MVP no podrás editarlo después de enviarlo.
        </p>
      </div>

      <label className='block space-y-2'>
        <span className='text-sm font-medium'>Título</span>
        <input
          className='h-11 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-primary'
          maxLength={180}
          onChange={event => setTitle(event.target.value)}
          placeholder='Título del artículo'
          value={title}
        />
      </label>

      <div className='space-y-2'>
        <span className='text-sm font-medium'>Contenido</span>
        <div className='flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted/40 p-2'>
          <Button aria-label='Negrita' onClick={() => format('bold')} size='icon' type='button' variant='ghost'><Bold /></Button>
          <Button aria-label='Cursiva' onClick={() => format('italic')} size='icon' type='button' variant='ghost'><Italic /></Button>
          <Button aria-label='Cita' onClick={() => format('formatBlock', 'blockquote')} size='icon' type='button' variant='ghost'><Quote /></Button>
          <Button aria-label='Lista' onClick={() => format('insertUnorderedList')} size='icon' type='button' variant='ghost'><List /></Button>
          <Button aria-label='Lista numerada' onClick={() => format('insertOrderedList')} size='icon' type='button' variant='ghost'><ListOrdered /></Button>
          <Button aria-label='Enlace' onClick={addLink} size='icon' type='button' variant='ghost'><Link /></Button>
        </div>
        <div
          className='prose min-h-80 max-w-none rounded-b-md border bg-background p-4 outline-none focus:ring-2 focus:ring-primary'
          contentEditable
          ref={editorRef}
          role='textbox'
          suppressContentEditableWarning
        />
      </div>

      <label className='flex items-start gap-3 rounded-md border p-4 text-sm'>
        <input
          checked={acceptedTerms}
          className='mt-1 size-4'
          onChange={event => setAcceptedTerms(event.target.checked)}
          type='checkbox'
        />
        <span>
          Confirmo que soy autor o poseo los derechos necesarios sobre este contenido. Entiendo que se publicará inmediatamente y que NoticiasCol se reserva el derecho de corregirlo, despublicarlo o eliminarlo conforme a sus normas editoriales y legales.
        </span>
      </label>

      {message && (
        <div className='rounded-md border bg-muted/40 p-4 text-sm' role='status'>
          {message}{' '}
          {publishedUrl && <a className='font-semibold underline' href={publishedUrl}>Ver artículo</a>}
        </div>
      )}

      <Button
        className='w-full'
        disabled={isSubmitting || !acceptedTerms || title.trim().length < 5}
        onClick={submit}
        size='lg'
        type='button'
      >
        {isSubmitting ? 'Publicando…' : 'Publicar artículo'}
      </Button>
    </div>
  )
}
