'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  X,
  Loader2,
  Send,
  MessageSquare,
  Users,
  Clock,
  ShieldAlert,
  Target,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import { submitDenuncia } from '@app/actions/submit-denuncia'
import { isProd } from '@lib/utils'
import { VENEZUELAN_REGIONS } from '@lib/constants'

const MAX_IMAGES = 3
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

declare global {
  interface Window {
    turnstile?: {
      reset(widget: HTMLElement): unknown
      getResponse: () => string
      render: (el: HTMLElement, opts: { sitekey: string }) => void
    }
  }
}

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

export default function DenunciaForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Location State
  const [selectedEstado, setSelectedEstado] = useState('Zulia')
  const [selectedMunicipio, setSelectedMunicipio] = useState('')
  const [selectedParroquia, setSelectedParroquia] = useState('')

  const estados = VENEZUELAN_REGIONS.map(r => r.estado).sort((a, b) =>
    a.localeCompare(b)
  )
  const municipios =
    VENEZUELAN_REGIONS.find(r => r.estado === selectedEstado)?.municipios || []
  const parroquias =
    municipios.find(m => m.municipio === selectedMunicipio)?.parroquias || []

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEstado(e.target.value)
    setSelectedMunicipio('')
    setSelectedParroquia('')
  }

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMunicipio(e.target.value)
    setSelectedParroquia('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles = Array.from(e.target.files)
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Imagen no soportada: ${file.name}`)
        return false
      }
      if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error(`Video no soportado: ${file.name}`)
        return false
      }
      return isImage || isVideo
    })

    setFiles(prev => {
      const combined = [...prev, ...validFiles]
      const video = combined.find(f => f.type.startsWith('video/'))
      return video ? [video] : combined.slice(0, MAX_IMAGES)
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFiles([])
    setSelectedMunicipio('')
    setSelectedParroquia('')
    formRef.current?.reset()

    if (window.turnstile) {
      const widget = document.getElementById('turnstile-widget')
      if (widget) {
        try {
          window.turnstile.reset(widget)
        } catch {
          /* ignore reset error */
        }
      }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    // Ensure location data is in formData
    if (!formData.has('estado')) formData.append('estado', selectedEstado)
    if (!formData.has('municipio'))
      formData.append('municipio', selectedMunicipio)
    if (!formData.has('parroquia'))
      formData.append('parroquia', selectedParroquia)

    files.forEach(file => formData.append('media', file))

    if (isProd) {
      const token = window.turnstile?.getResponse()
      if (!token) {
        toast.error('Por favor verifica que no eres un robot.')
        setIsSubmitting(false)
        return
      }
      formData.append('token', token)
    }

    try {
      const result = await submitDenuncia(formData)
      if (result.success) {
        toast.success(
          result.message || 'Tu denuncia ha sido enviada correctamente.'
        )
        resetForm()
      } else {
        toast.error(result.error || 'Ocurrió un error al enviar la denuncia.')
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Debes subir al menos una foto o un video de la denuncia.')
      return
    }

    const formData = new FormData(e.currentTarget)
    void handleSubmit(formData)
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleFormSubmit}
      className='bg-card mx-auto max-w-2xl space-y-6 rounded-xl border p-6 shadow-sm'
    >
      <div className='space-y-4'>
        <div>
          <label htmlFor='title' className='mb-1 block text-sm font-medium'>
            ¿Qué está pasando? <span className='text-destructive'>*</span>
          </label>
          <input
            type='text'
            id='title'
            name='title'
            required
            placeholder='Ej: Bote de aguas negras en el Sector Las Morochas'
            className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label htmlFor='estado' className='mb-1 block text-sm font-medium'>
              Estado <span className='text-destructive'>*</span>
            </label>
            <select
              id='estado'
              name='estado'
              value={selectedEstado}
              onChange={handleEstadoChange}
              required
              className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none'
            >
              <option value=''>Seleccione un estado</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor='municipio'
              className='mb-1 block text-sm font-medium'
            >
              Municipio <span className='text-destructive'>*</span>
            </label>
            <select
              id='municipio'
              name='municipio'
              value={selectedMunicipio}
              onChange={handleMunicipioChange}
              required
              disabled={!selectedEstado}
              className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50'
            >
              <option value=''>Seleccione un municipio</option>
              {municipios.map(m => (
                <option key={m.municipio} value={m.municipio}>
                  {m.municipio}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label
              htmlFor='parroquia'
              className='mb-1 block text-sm font-medium'
            >
              Parroquia <span className='text-destructive'>*</span>
            </label>
            <select
              id='parroquia'
              name='parroquia'
              value={selectedParroquia}
              onChange={e => setSelectedParroquia(e.target.value)}
              required
              disabled={!selectedMunicipio}
              className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50'
            >
              <option value=''>Seleccione una parroquia</option>
              {parroquias.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='sector' className='mb-1 block text-sm font-medium'>
              Sector/Referencia <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              id='sector'
              name='sector'
              required
              placeholder='Ej: Las Morochas, frente a la farmacia'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>
          La ubicación es importante para organizar las denuncias por zona.
        </p>

        <div className='bg-muted/25 space-y-6 rounded-xl border p-6'>
          <div className='border-border/50 flex items-center gap-2 border-b pb-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Info className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3 className='text-primary text-sm font-bold tracking-wider uppercase'>
                Detalles de la Denuncia
              </h3>
              <p className='text-muted-foreground text-[11px]'>
                Responde estas preguntas para generar un informe detallado.
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='details'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <MessageSquare className='text-primary/70 h-4 w-4' />
              1. ¿Qué ocurrió exactamente?{' '}
              <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='details'
              name='details'
              required
              rows={4}
              placeholder='Describe detalladamente los hechos, qué está pasando...'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='involved'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Users className='text-primary/70 h-4 w-4' />
              2. ¿Quiénes son los afectados o responsables?{' '}
              <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='involved'
              name='involved'
              required
              rows={2}
              placeholder='Vecinos de un sector, una empresa específica, organismo, etc...'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='timeline'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Clock className='text-primary/70 h-4 w-4' />
              3. ¿Desde cuándo ocurre esto o cuándo pasó?{' '}
              <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              id='timeline'
              name='timeline'
              required
              placeholder='Ej: Desde hace 3 meses, el pasado lunes a las 10am...'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='actions'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <ShieldAlert className='text-primary/70 h-4 w-4' />
              4. ¿Se ha hecho alguna denuncia previa a las autoridades?{' '}
              <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='actions'
              name='actions'
              required
              rows={2}
              placeholder='¿A qué organismo? ¿Hubo alguna respuesta o solución?'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='solution'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Target className='text-primary/70 h-4 w-4' />
              5. ¿Qué solución espera o qué pide a las autoridades?{' '}
              <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='solution'
              name='solution'
              required
              rows={2}
              placeholder='¿Qué necesita que se resuelva prioritariamente?'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>
        </div>

        <div className='space-y-3'>
          <span className='block flex items-center gap-2 text-sm font-semibold'>
            <Upload className='text-primary/70 h-4 w-4' />
            Multimedia (Max 3 fotos o 1 video){' '}
            <span className='text-destructive'>*</span>
          </span>
          <p className='text-muted-foreground text-[11px]'>
            Es obligatorio incluir evidencia visual (fotos o video) para validar
            la denuncia.
          </p>

          <div className='mb-3 flex flex-wrap gap-4'>
            {files.map((file, index) => (
              <div
                key={index}
                className='group bg-muted relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border'
              >
                {file.type.startsWith('image/') ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={URL.createObjectURL(file)}
                    alt='preview'
                    className='h-full w-full object-cover'
                    onLoad={e => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                ) : (
                  <div className='p-1 text-center text-xs break-words'>
                    {file.name}
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => removeFile(index)}
                  className='bg-destructive/80 absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ))}

            {files.length < MAX_IMAGES &&
              !files.some(f => f.type.startsWith('video/')) && (
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='border-input text-muted-foreground hover:bg-accent/50 flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors'
                  aria-label='Subir archivo'
                >
                  <Upload className='mb-1 h-6 w-6' />
                  <span className='text-xs'>Subir</span>
                </button>
              )}
          </div>

          <input
            id='media-upload'
            type='file'
            ref={fileInputRef}
            className='hidden'
            accept='image/png, image/jpeg, image/webp, video/mp4, video/webm'
            multiple
            onChange={handleFileChange}
          />
        </div>

        <div className='border-t pt-4'>
          <h3 className='mb-3 text-sm font-medium'>
            Datos de Contacto (Privados)
          </h3>
          <p className='text-muted-foreground mb-4 text-xs'>
            Esta información es solo para verificación por parte de nuestro
            equipo. No será publicada.
          </p>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label
                htmlFor='contactName'
                className='mb-1 block text-sm font-medium'
              >
                Nombre Completo <span className='text-destructive'>*</span>
              </label>
              <input
                type='text'
                id='contactName'
                name='contactName'
                required
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              />
            </div>
            <div>
              <label
                htmlFor='whatsapp'
                className='mb-1 block text-sm font-medium'
              >
                WhatsApp <span className='text-destructive'>*</span>
              </label>
              <input
                type='tel'
                id='whatsapp'
                name='whatsapp'
                required
                placeholder='412 1234567'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              />
            </div>
          </div>
          <div className='mt-4'>
            <label
              htmlFor='contactEmail'
              className='mb-1 block text-sm font-medium'
            >
              Correo Electrónico{' '}
              <span className='text-muted-foreground text-[10px]'>
                (Opcional)
              </span>
            </label>
            <input
              type='email'
              id='contactEmail'
              name='contactEmail'
              placeholder='tu@email.com'
              className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            />
          </div>
        </div>

        <div className='flex items-center space-x-2 pt-2'>
          <input
            type='checkbox'
            id='anonymous'
            name='anonymous'
            className='text-primary focus:ring-primary h-4 w-4 rounded border-gray-300'
          />
          <label
            htmlFor='anonymous'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Quiero que mi nombre{' '}
            <span className='font-bold'>sea publicado</span> en la nota
          </label>
        </div>

        <div className='pt-4'>
          {isProd && <TurnstileWidget />}
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Enviando denuncia...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Enviar Denuncia
              </>
            )}
          </Button>
        </div>
      </div>
      {isProd && (
        <script
          src='https://challenges.cloudflare.com/turnstile/v0/api.js'
          async
          defer
        />
      )}
    </form>
  )
}
