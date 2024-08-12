'use client'

import { useState } from 'react'

import { useSearchParams, usePathname } from 'next/navigation'

import { revalidateDataPath } from '@app/actions/revalidate'

const RevalidateForm = ({ autoRevalidate }: { autoRevalidate?: boolean }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const search = searchParams.get('revalidate')
  const pathname = usePathname()

  if (autoRevalidate) {
    revalidateDataPath(pathname)
  }

  if (!search) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await revalidateDataPath(pathname)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type='submit' disabled={isSubmitting}>
        Revalidate
      </button>
    </form>
  )
}

export { RevalidateForm }
