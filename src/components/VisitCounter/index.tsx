'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/browser'

const isPostOlderThan = (days: number, dateString?: string) => {
  if (!dateString) return false
  const postDate = new Date(dateString)
  const now = new Date()
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > days
}

type Props = {
  slug: string
  dateString?: string
}

const apiClient = new HttpClient()

export const VisitCounter = ({ slug, dateString }: Props) => {
  const [viewCount, setViewCount] = useState<number>(0)

  useEffect(() => {
    const recordView = async () => {
      try {
        const result = await apiClient.post('/api/views/', {
          slug,
          count: 1
        })
        setViewCount(result.count ?? 1)
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    if (!isPostOlderThan(30, dateString)) {
      recordView()
    }
  }, [slug, dateString])

  if (isPostOlderThan(30, dateString)) return null

  if (viewCount < 10) return null

  return (
    <>
      <span className='px-2'>|</span>
      <span className='flex items-center gap-1 text-sm'>
        <Eye size={17} />
        {viewCount}
      </span>
    </>
  )
}
