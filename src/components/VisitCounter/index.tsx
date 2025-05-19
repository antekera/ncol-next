'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/browser'

type Props = {
  slug: string
  debounceMs?: number
}

export const apiClient = new HttpClient()

export const VisitCounter = ({ slug, debounceMs = 1000 }: Props) => {
  const [countFromServer, setCountFromServer] = useState(0)
  const [localCount, setLocalCount] = useState(0)
  const hasViewed = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasViewed.current) {
        setLocalCount(1)
        hasViewed.current = true
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [slug, debounceMs])

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const data = await apiClient.get('/api/get-views/', {
          params: { slug }
        })
        setCountFromServer(data.count ?? 0)
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    fetchViews()
  }, [slug])

  useEffect(() => {
    const flushVisits = async () => {
      if (localCount > 0) {
        try {
          const data = await apiClient.post('/api/flush-views/', {
            slug,
            count: localCount
          })
          setCountFromServer(data.count ?? countFromServer)
          setLocalCount(0)
        } catch (error) {
          Sentry.captureException(error)
        }
      }
    }

    window.addEventListener('beforeunload', flushVisits)
    return () => window.removeEventListener('beforeunload', flushVisits)
  }, [slug, localCount, countFromServer])

  return (
    <span className='flex items-center gap-1 text-sm'>
      <Eye size={17} />
      {countFromServer + localCount}
    </span>
  )
}
