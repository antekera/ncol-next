'use client'

import { useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { revalidateDataPath } from '@app/actions/revalidate'

const RevalidateForm = ({ path }: { path: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const search = searchParams.get('revalidate')

  if (!search) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await revalidateDataPath(path)
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
