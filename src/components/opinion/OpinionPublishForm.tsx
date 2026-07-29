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
  const [postStatus, setPostStatus] = useState<'publish' | 'draft' | null>(null)

  const format = (command: string, value?: string) => {
    editorRef.current?.focus()
    // eslint-disable-next-line sonarjs/deprecation
    document.execCommand(command, false, value)
  }

  const addLink = () => {
    const url = window.prompt('URL del enlace')
    if (url) format('createLink', url)
  }

  const submit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    setPostStatus(null)

    try {
      const content = editorRef.current?.innerHTML ?? ''
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
        setMessage(result.message ?? 'No se pudo enviar el artículo.')
        return
      }

      const status: 'publish' | 'draft' = result.postStatus ?? 'draft'
      setPostStatus(status)
      setPublishedUrl(result.post?.url ?? null)
      setMessage(
        status === 'publish'
          ? 'Tu artículo fue publicado correctamente.'
          : 'Tu artículo fue recibido y está pendiente de revisión editorial.'
      )
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
    <div className='bg-background mx-auto max-w-3xl space-y-6 rounded-xl border p-5 shadow-sm md:p-8'>
      <div>
        <p className='text-primary text-sm font-semibold tracking-wide uppercase'>
          Opinión
        </p>
        <h1 className='mt-1 text-3xl font-bold'>Enviar un artículo</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Tu artículo será recibido por el equipo editorial de NoticiasCol. Una
          vez enviado no podrás editarlo desde este portal.
        </p>
      </div>

      <label className='block space-y-2'>
        <span className='text-sm font-medium'>Título</span>
        <input
          className='bg-background focus:ring-primary h-11 w-full rounded-md border px-3 outline-none focus:ring-2'
          maxLength={180}
          onChange={event => setTitle(event.target.value)}
          placeholder='Título del artículo'
          value={title}
        />
      </label>

      <div className='space-y-2'>
        <span className='text-sm font-medium'>Contenido</span>
        <div className='bg-muted/40 flex flex-wrap gap-1 rounded-t-md border border-b-0 p-2'>
          <Button
            aria-label='Negrita'
            onClick={() => format('bold')}
            size='icon'
            type='button'
            variant='ghost'
          >
            <Bold />
          </Button>
          <Button
            aria-label='Cursiva'
            onClick={() => format('italic')}
            size='icon'
            type='button'
            variant='ghost'
          >
            <Italic />
          </Button>
          <Button
            aria-label='Cita'
            onClick={() => format('formatBlock', 'blockquote')}
            size='icon'
            type='button'
            variant='ghost'
          >
            <Quote />
          </Button>
          <Button
            aria-label='Lista'
            onClick={() => format('insertUnorderedList')}
            size='icon'
            type='button'
            variant='ghost'
          >
            <List />
          </Button>
          <Button
            aria-label='Lista numerada'
            onClick={() => format('insertOrderedList')}
            size='icon'
            type='button'
            variant='ghost'
          >
            <ListOrdered />
          </Button>
          <Button
            aria-label='Enlace'
            onClick={addLink}
            size='icon'
            type='button'
            variant='ghost'
          >
            <Link />
          </Button>
        </div>
        <div
          className='prose bg-background focus:ring-primary min-h-80 max-w-none rounded-b-md border p-4 outline-none focus:ring-2'
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
          Confirmo que soy autor o poseo los derechos necesarios sobre este
          contenido y que NoticiasCol se reserva el derecho de corregirlo,
          despublicarlo o eliminarlo conforme a sus normas editoriales y
          legales.
        </span>
      </label>

      {message && (
        <div
          className='bg-muted/40 rounded-md border p-4 text-sm'
          role='status'
        >
          {message}{' '}
          {postStatus === 'publish' && publishedUrl && (
            <a className='font-semibold underline' href={publishedUrl}>
              Ver artículo
            </a>
          )}
        </div>
      )}

      <Button
        className='w-full'
        disabled={isSubmitting || !acceptedTerms || title.trim().length < 5}
        onClick={() => void submit()}
        size='lg'
        type='button'
      >
        {isSubmitting ? 'Enviando…' : 'Enviar artículo'}
      </Button>
    </div>
  )
}
