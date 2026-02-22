'use client'

import { useRef, useState, useCallback } from 'react'
import { HoroscopoData } from '@lib/hooks/data/useHoroscopo'
import { getZodiacSign } from '@lib/horoscopo'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface HoroscopoShareImageProps {
  horoscopo: HoroscopoData
  category?: 'introduccion' | 'amor' | 'riqueza' | 'bienestar'
}

const CATEGORY_LABELS = {
  introduccion: { label: 'Predicción', icon: '🔮' },
  amor: { label: 'Amor', icon: '❤️' },
  riqueza: { label: 'Riqueza', icon: '💰' },
  bienestar: { label: 'Bienestar', icon: '🧘' }
}

const BRAND_LOGO_SVG = `<svg width="220" height="32" viewBox="0 0 600 72" xmlns="http://www.w3.org/2000/svg"><g id="Layer_1"><path transform="translate(-0.47, 0.13)" d="m-0.00001,18.05l13,0l0,6.18l0.2,0c2.8,-5.2 7.6,-7.57 13.39,-7.57c8.53,0 13.44,4.51 13.44,15l0,39.17l-13.53,0l0,-36.4c0,-5.39 -1.77,-7.36 -5.79,-7.36c-4.81,0 -7.16,2.94 -7.16,8.73l0,35l-13.55,0l0,-52.75z" class="fill-primary cls-2 dark:fill-white"></path><path d="m66.64999,16.79c16.19,-0.29 20.8,9.32 20.8,27.77c0,18.05 -5.39,27.76 -20.8,27.76c-16.19,0.31 -20.83,-9.31 -20.83,-27.75c0,-18.05 5.42,-27.78 20.83,-27.78zm0,46.31c5.49,0 7.26,-5.3 7.26,-18.54s-1.76,-18.54 -7.26,-18.54c-6.67,0 -7.26,7.75 -7.26,18.54s0.58,18.55 7.26,18.55l0,-0.01z" class="fill-primary cls-2 dark:fill-white"></path><path d="m95.66999,3.07l13.54,0l0,15.11l7.85,0l0,9.22l-7.85,0l0,28.55c0,4.22 0.89,5.78 4.81,5.78a28,28 0 0 0 3,-0.19l0,9.42a87,87 0 0 1 -8.83,0.59c-10.6,0 -12.56,-3.34 -12.56,-13.93l0,-30.22l-6.81,0l0,-9.22l6.87,0l-0.02,-15.11z" class="fill-primary cls-2 dark:fill-white"></path><path transform="translate(-0.47, 0.13)" d="m122.74999,0l13.54,0l0,11.57l-13.54,0l0,-11.57zm0,18.05l13.54,0l0,52.78l-13.54,0l0,-52.78z" class="fill-primary cls-2 dark:fill-white"></path><path d="m169.76999,37.21c0,-5.1 -1,-10.59 -6.08,-10.59c-6.67,0 -7.75,5.89 -7.75,18.05c0,13 1.27,18.44 7.26,18.44c4.61,0 6.57,-3.73 6.57,-12.36l12.95,0c0,13.83 -5.69,21.58 -20.11,21.58c-13.54,0 -20.21,-6.57 -20.21,-27.76c0,-21.68 8.83,-27.78 21.42,-27.78s18.93,7.85 18.93,20.4l-12.98,0.02z" class="fill-primary cls-2 dark:fill-white"></path><path d="m189.29999,0.13l13.52,0l0,11.57l-13.52,0l0,-11.57zm0,18.05l13.52,0l0,52.78l-13.52,0l0,-52.78z" class="fill-primary cls-2 dark:fill-white"></path><path d="m211.27999,34.37l0,-1.28c0,-12.17 8.34,-16.3 18.54,-16.3c16.09,0 19.13,6.67 19.13,16.19l0,27.81c0,5 0.39,7.06 1.67,10.2l-13,0a20.92,20.92 0 0 1 -1.67,-5.5l-0.13,0c-3.14,5.5 -6.87,6.87 -13.44,6.87c-9.42,0 -12.75,-8 -12.75,-15.11c0,-10 4,-13.93 13.34,-16.48l7.65,-2.06c4,-1.08 5.4,-2.65 5.4,-6.18c0,-4 -1.67,-6.47 -6.28,-6.47c-4.22,0 -6.28,2.65 -6.28,6.87l0,1.47l-12.18,-0.03zm24.73,10.2a15.2,15.2 0 0 1 -5.79,2.65c-5.49,1.18 -7.65,3.83 -7.65,8.53c0,4 1.47,7.36 5.1,7.36s8.34,-2.26 8.34,-8.14l0,-10.4z" class="fill-primary cls-2 dark:fill-white"></path><path d="m267.49999,53.69l0,1.77c0,4.61 2.45,7.65 7.07,7.65c4.22,0 6.87,-2.06 6.87,-6.28c0,-3.43 -2.26,-4.9 -4.91,-6l-9.52,-3.44c-7.46,-2.6 -11.29,-7.23 -11.29,-14.69c0,-8.63 5.59,-15.89 19.43,-15.89c12.26,0 18.05,5.49 18.05,15l0,2.16l-12.16,0c0,-5.4 -1.57,-7.95 -6,-7.95c-3.43,0 -6.38,1.86 -6.38,5.69c0,2.65 1.28,4.71 5.89,6.18l8.14,2.75c8.55,2.85 11.69,7.15 11.69,15.15c0,11.09 -8.24,16.58 -19.62,16.58c-15.3,0 -19.43,-6.57 -19.43,-16.78l0,-1.9l12.17,0z" class="fill-primary cls-2 dark:fill-white"></path><path transform="translate(-0.47, 0.13)" fill="#f6921e" d="m329.48999,37.08c0,-5.1 -1,-10.59 -6.08,-10.59c-6.67,0 -7.75,5.89 -7.75,18.05c0,13 1.28,18.44 7.26,18.44c4.61,0 6.57,-3.73 6.57,-12.36l13,0c0,13.83 -5.69,21.58 -20.11,21.58c-13.54,0 -20.21,-6.57 -20.21,-27.76c0,-21.68 8.83,-27.77 21.39,-27.77s18.94,7.85 18.94,20.4l-13.01,0.01z" class="cls-3"></path><path transform="translate(-0.47, 0.13)" fill="#fc8c29" d="m367.55999,16.66c16.19,-0.29 20.8,9.32 20.8,27.77c0,18.05 -5.4,27.76 -20.8,27.76c-16.19,0.29 -20.8,-9.32 -20.8,-27.76c0,-18.04 5.4,-27.77 20.8,-27.77zm0,46.31c5.5,0 7.26,-5.3 7.26,-18.54s-1.76,-18.54 -7.26,-18.54c-6.67,0.01 -7.27,7.77 -7.27,18.55s0.6,18.54 7.27,18.54l0,-0.01z" class="cls-3"></path><path transform="translate(-0.47, 0.13)" fill="#fc8c29" d="m395.13999,0.78l13.54,0l0,70l-13.54,0l0,-70z" class="cls-3"></path><path fill="#a6a8ab" d="m435.60999,55.66l0,15.3l-13,0l0,-15.3l13,0z" class="cls-4"></path><path fill="#a6a8ab" d="m469.81999,37.21c0,-5.1 -1,-10.59 -6.08,-10.59c-6.67,0 -7.75,5.89 -7.75,18.05c0,13 1.27,18.44 7.26,18.44c4.61,0 6.57,-3.73 6.57,-12.36l13,0c0,13.83 -5.69,21.58 -20.11,21.58c-13.54,0 -20.21,-6.57 -20.21,-27.76c-0.02,-21.68 8.81,-27.78 21.32,-27.78s19,7.86 19,20.42l-13,0z" class="cls-4"></path><path fill="#a6a8ab" d="m507.92999,16.79c16.19,-0.29 20.8,9.32 20.8,27.77c0,18.05 -5.39,27.76 -20.8,27.76c-16.19,0.29 -20.8,-9.32 -20.8,-27.76c-0.01,-18.04 5.39,-27.77 20.8,-27.77zm0,46.31c5.49,0 7.26,-5.3 7.26,-18.54s-1.77,-18.54 -7.26,-18.54c-6.67,0 -7.26,7.75 -7.26,18.54s0.58,18.55 7.26,18.55l0,-0.01z" class="cls-4"></path><path fill="#a6a8ab" d="m535.00999,18.18l13,0l0,5.39l0.2,0c3.38,-4.78 7.5,-6.78 13.29,-6.78c6.28,0 10.69,2.94 12.17,8.44l0.2,0c2.06,-5.59 7,-8.44 13.34,-8.44c9,0 13.15,5.59 13.15,15.8l0,38.37l-13.54,0l0,-36.89c0,-4.41 -1.47,-6.87 -5.3,-6.87c-4.32,0 -7.06,2.85 -7.06,9l0,34.76l-13.55,0l0,-36.89c0,-4.41 -1.47,-6.87 -5.3,-6.87c-4.32,0 -7.06,2.85 -7.06,9l0,34.76l-13.54,0l0,-52.78z" class="cls-4"></path></g></svg>`

export function HoroscopoShareImage({
  horoscopo,
  category = 'introduccion'
}: HoroscopoShareImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(category)

  const zodiacInfo = getZodiacSign(horoscopo.signo)

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || !zodiacInfo) return

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Canvas dimensions (Instagram story size)
      const width = 1080
      const height = 1920
      canvas.width = width
      canvas.height = height

      // Clean drawing state
      ctx.strokeStyle = 'transparent'
      ctx.lineWidth = 0
      ctx.lineJoin = 'miter'
      ctx.lineCap = 'butt'
      ctx.shadowBlur = 0

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#1e1b4b') // dark indigo
      gradient.addColorStop(0.5, '#312e81') // indigo
      gradient.addColorStop(1, '#1e1b4b') // dark indigo
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Decorative stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      const randomValues = new Uint32Array(150)
      window.crypto.getRandomValues(randomValues)
      for (let i = 0; i < 50; i++) {
        const x = (randomValues[i * 3] / 0xffffffff) * width
        const y = (randomValues[i * 3 + 1] / 0xffffffff) * height
        const size = (randomValues[i * 3 + 2] / 0xffffffff) * 3 + 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Logo SVG at top
      const logoImg = new Image()
      // Clean up the SVG: remove specific attributes and force solid white fill
      // We use the full original SVG to ensure path coordinates (and dots) are perfect
      const svgData = BRAND_LOGO_SVG.replace(/class="[^"]*"/g, '')
        .replace(/style="[^"]*"/g, '')
        .replace(/fill="[^"]*"/g, '')
        .replace(/stroke="[^"]*"/g, '')
        .replace(/<path/g, '<path fill="#ffffff" stroke="none"')
        .replace(/<svg/g, '<svg fill="#ffffff" stroke="none"')

      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      })
      const url = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve
        logoImg.onerror = reject
        logoImg.src = url
      })

      const logoW = 450
      const logoH = 54
      ctx.drawImage(logoImg, (width - logoW) / 2, 80, logoW, logoH)
      URL.revokeObjectURL(url)

      // Zodiac symbol
      ctx.textAlign = 'center'
      ctx.font = '200px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = zodiacInfo.color
      ctx.fillText(zodiacInfo.symbol, width / 2, 400)

      // Signo name
      ctx.font = 'bold 80px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(zodiacInfo.nombre.toUpperCase(), width / 2, 520)

      // Week range
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(`${dateStr}T12:00:00`)
          return format(date, "d 'de' MMM", { locale: es })
        } catch {
          return dateStr
        }
      }

      ctx.font = '36px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText(
        `Semana del ${formatDate(horoscopo.semana_inicio)} al ${formatDate(horoscopo.semana_fin)}`,
        width / 2,
        580
      )

      // Category header
      // Category header
      let categoryInfo = CATEGORY_LABELS.introduccion
      if (selectedCategory === 'amor') categoryInfo = CATEGORY_LABELS.amor
      else if (selectedCategory === 'riqueza')
        categoryInfo = CATEGORY_LABELS.riqueza
      else if (selectedCategory === 'bienestar')
        categoryInfo = CATEGORY_LABELS.bienestar
      ctx.font = '48px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = zodiacInfo.color
      ctx.fillText(`${categoryInfo.icon} ${categoryInfo.label}`, width / 2, 760)

      // Prediction text
      let text = horoscopo.introduccion
      if (selectedCategory === 'amor') text = horoscopo.amor
      else if (selectedCategory === 'riqueza') text = horoscopo.riqueza
      else if (selectedCategory === 'bienestar') text = horoscopo.bienestar

      // Word wrap the text
      ctx.font = '42px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#ffffff'
      const maxWidth = width - 160
      const lineHeight = 60
      const words = text.split(' ')
      let line = ''
      let y = 880

      words.forEach((word, i) => {
        const testLine = `${line}${word} `
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), width / 2, y)
          line = `${word} `
          y += lineHeight
        } else {
          line = testLine
        }
      })
      ctx.fillText(line.trim(), width / 2, y)

      // Footer
      ctx.font = '32px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fillText('Horóscopo Semanal', width / 2, height - 100)
      ctx.fillText('noticiascol.com/horoscopo', width / 2, height - 50)

      // Trigger download
      const link = document.createElement('a')
      link.download = `horoscopo-${horoscopo.signo}-${selectedCategory}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Error handled by state or just ignored for UI
    } finally {
      setIsGenerating(false)
    }
  }, [horoscopo, selectedCategory, zodiacInfo])

  const handleCategoryChange = (cat: keyof typeof CATEGORY_LABELS) => {
    setSelectedCategory(cat)
  }

  if (!zodiacInfo) return null

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-6 font-sans dark:border-neutral-700 dark:bg-neutral-800'>
      <h3 className='mb-4 text-lg font-bold text-slate-800 dark:text-neutral-100'>
        Compartir en Instagram
      </h3>

      {/* Category selector */}
      <div className='mb-4 flex flex-wrap gap-2'>
        {(
          Object.entries(CATEGORY_LABELS) as [
            keyof typeof CATEGORY_LABELS,
            { label: string; icon: string }
          ][]
        ).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Preview canvas (hidden, used for generation) */}
      <canvas ref={canvasRef} className='hidden' width={1080} height={1920} />

      {/* Actions */}
      <div className='flex gap-3'>
        <button
          onClick={() => {
            void handleShare()
          }}
          disabled={isGenerating}
          className='bg-primary hover:bg-primary/90 flex-1 rounded-lg px-4 py-3 font-medium text-white transition-colors disabled:opacity-50'
        >
          {isGenerating ? 'Generando...' : '📸 Descargar para Instagram'}
        </button>
      </div>

      <p className='mt-3 text-center text-xs text-slate-500 dark:text-neutral-400'>
        Genera la imagen y compártela en tus historias de Instagram
      </p>
    </div>
  )
}
