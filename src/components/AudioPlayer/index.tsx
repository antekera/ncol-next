'use client'

import { useRef, useState } from 'react'
import { GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

interface AudioPlayerProps {
  postId: string | number
  text: string
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayIcon() {
  return (
    <svg
      className='h-4 w-4'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M8 5v14l11-7L8 5z' />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      className='h-4 w-4'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <rect x='6' y='4' width='4' height='16' rx='1' />
      <rect x='14' y='4' width='4' height='16' rx='1' />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className='h-4 w-4 animate-spin'
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
      />
    </svg>
  )
}

export function AudioPlayer({ postId, text }: AudioPlayerProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  async function handlePlayPause() {
    if (status === 'loading') return

    if (!audioUrl) {
      setStatus('loading')
      try {
        const tokenRes = await fetch('/api/audio/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        })
        if (!tokenRes.ok) throw new Error('token fetch failed')
        const { token } = await tokenRes.json()

        const audioRes = await fetch('/api/audio/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, text, token })
        })
        if (!audioRes.ok) throw new Error('audio fetch failed')
        const { url } = await audioRes.json()

        setAudioUrl(url)
        if (audioRef.current) {
          audioRef.current.src = url
          await audioRef.current.play()
        }
        GAEvent({
          category: GA_EVENTS.AUDIO_PLAYER.CATEGORY,
          label: GA_EVENTS.AUDIO_PLAYER.PLAY
        })
        setStatus('playing')
      } catch {
        setStatus('error')
      }
      return
    }

    if (!audioRef.current) return

    if (status === 'playing') {
      audioRef.current.pause()
      GAEvent({
        category: GA_EVENTS.AUDIO_PLAYER.CATEGORY,
        label: GA_EVENTS.AUDIO_PLAYER.PAUSE
      })
      setStatus('paused')
    } else {
      await audioRef.current.play()
      GAEvent({
        category: GA_EVENTS.AUDIO_PLAYER.CATEGORY,
        label: GA_EVENTS.AUDIO_PLAYER.PLAY
      })
      setStatus('playing')
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const el = e.currentTarget
    const seekTime = (e.nativeEvent.offsetX / el.offsetWidth) * duration
    audioRef.current.currentTime = seekTime
  }

  function handleProgressKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const step = 5
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      if (e.key === 'ArrowRight') {
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + step,
          duration
        )
      } else {
        audioRef.current.currentTime = Math.max(
          audioRef.current.currentTime - step,
          0
        )
      }
    }
  }

  if (status === 'error') {
    return <p className='text-sm text-red-500'>No se pudo cargar el audio</p>
  }

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  let buttonIcon: React.ReactNode
  if (isLoading) {
    buttonIcon = <SpinnerIcon />
  } else if (isPlaying) {
    buttonIcon = <PauseIcon />
  } else {
    buttonIcon = <PlayIcon />
  }

  return (
    <>
      <p className='mb-1 font-sans text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-neutral-400'>
        Escuchar noticia
      </p>
      <div className='flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800'>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- audio is TTS generated, no caption track available */}
        <audio
          ref={audioRef}
          onTimeUpdate={() =>
            setCurrentTime(audioRef.current?.currentTime ?? 0)
          }
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          onEnded={() => setStatus('paused')}
        />

        <button
          onClick={() => void handlePlayPause()}
          aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700'
        >
          {buttonIcon}
        </button>

        <div
          className='relative h-1.5 flex-1 cursor-pointer rounded-full bg-gray-300 dark:bg-gray-600'
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
          aria-label='Progreso del audio'
          role='slider'
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          tabIndex={0}
        >
          <div
            className='h-full rounded-full bg-blue-600'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className='min-w-[80px] flex-shrink-0 text-right font-mono text-xs text-gray-500 dark:text-gray-400'>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </>
  )
}
