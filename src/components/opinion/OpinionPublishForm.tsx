'use client'

import { useRef, useState } from 'react'
import { Bold, Italic, Link, List, ListOrdered, Quote } from 'lucide-react'

import { Button } from '@components/ui/button'

const TERMS_VERSION = '2026-07-01'

type AllowedCategory = { slug: string; name: string }

type Props = {
  token: string
  allowedCategories: AllowedCategory[]
}

export default function OpinionPublishForm({
  token,
  allowedCategories
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(allowedCategories[0]?.slug ?? '')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [postStatus, setPostStatus] = useState<'publish' | 'draft' | null>(null)

  const normalizeTitle = (value: string): string => {
    const letters = value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '')
    if (letters.length === 0 || letters !== letters.toUpperCase()) return value
    return value
      .toLowerCase()
      .replace(/(^\s*\S|[.!?]\s+\S)/g, c => c.toUpperCase())
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    const html = text
      .split(/\n{2,}/)
      .map(para => `<p>${para.replace(/\n/g, ' ').trim()}</p>`)
      .filter(p => p !== '<p></p>')
      .join('')
    // eslint-disable-next-line sonarjs/deprecation
    document.execCommand('insertHTML', false, html || `<p>${text}</p>`)
  }

  const normalizeContent = (html: string): string => {
    // Replace div/br-only blocks with p tags (contentEditable browser quirks)
    return html
      .replace(/<div>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<p><br\s*\/?><\/p>/gi, '')
      .trim()
  }

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
      const content = normalizeContent(editorRef.current?.innerHTML ?? '')
      const response = await fetch('/api/opinion/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title,
          content,
          category,
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

  const categoryLabel =
    allowedCategories.find(c => c.slug === category)?.name ?? 'Artículo'

  return (
    <div className='bg-background mx-auto max-w-3xl space-y-6 rounded-xl border p-5 shadow-sm md:p-8'>
      <div>
        <p className='text-primary text-sm font-semibold tracking-wide uppercase'>
          {allowedCategories.length === 1 ? categoryLabel : 'Publicar'}
        </p>
        <h1 className='mt-1 text-3xl font-bold'>Enviar un artículo</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Tu artículo será recibido por el equipo editorial de NoticiasCol. Una
          vez enviado no podrás editarlo desde este portal.
        </p>
      </div>

      {allowedCategories.length > 1 && (
        <label className='block space-y-2'>
          <span className='text-sm font-medium'>Tipo de artículo</span>
          <select
            className='bg-background focus:ring-primary h-11 w-full rounded-md border px-3 outline-none focus:ring-2'
            onChange={event => setCategory(event.target.value)}
            value={category}
          >
            {allowedCategories.map(c => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className='block space-y-2'>
        <span className='text-sm font-medium'>Título</span>
        <input
          className='bg-background focus:ring-primary h-11 w-full rounded-md border px-3 outline-none focus:ring-2'
          maxLength={180}
          onBlur={event => setTitle(normalizeTitle(event.target.value))}
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
          onPaste={handlePaste}
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
          className={`rounded-md border p-4 text-sm ${
            postStatus
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
              : 'bg-muted/40'
          }`}
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
