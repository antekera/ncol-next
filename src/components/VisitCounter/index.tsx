'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/nextjs'
import { isDev } from '@lib/utils'
import { Skeleton } from '@components/ui/skeleton'

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
  featuredImage: string
  title: string
}

const apiClient = new HttpClient()

export const VisitCounter = ({
  slug,
  dateString,
  featuredImage,
  title
}: Props) => {
  const [viewCount, setViewCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const recordView = async () => {
      setIsLoading(true)
      try {
        const { data } = await apiClient.post<{ count: number }>(
          '/api/views/',
          {
            slug,
            count: 1,
            featuredImage,
            title
          }
        )
        setViewCount(data?.count ?? 1)
      } catch (error) {
        Sentry.captureException(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isPostOlderThan(30, dateString) && !isDev) {
      void recordView()
    }
  }, [slug, dateString, featuredImage, title])

  if (isPostOlderThan(30, dateString)) return null

  if (isLoading && !isDev) {
    return (
      <>
        <span className='px-2'>|</span>
        <span className='flex min-w-[45px] items-center gap-1 text-sm'>
          <Eye size={17} />
          <Skeleton className='h-4 w-4 rounded' />
        </span>
      </>
    )
  }

  if (viewCount < 10 && !isDev) return null

  return (
    <>
      <span className='px-2'>|</span>
      <span className='flex min-w-[45px] items-center gap-1 text-sm'>
        <Eye size={17} />
        {!isDev ? viewCount : '00000'}
      </span>
    </>
  )
}
