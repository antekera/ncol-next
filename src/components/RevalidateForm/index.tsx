'use client'

import { useEffect, useState } from 'react'
import { revalidateDataPath } from '@app/actions/revalidate'
import { useRouter } from 'next/navigation'

const RevalidateForm = ({ autoRevalidate }: { autoRevalidate?: boolean }) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState<string | null>(null)
  const [pathname, setPathname] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await revalidateDataPath(pathname)
    router.refresh()
    setIsSubmitting(false)
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setSearch(searchParams.get('revalidate'))
    setPathname(window.location.pathname)

    if (autoRevalidate) {
      revalidateDataPath(window.location.pathname)
    }
  }, [autoRevalidate])

  if (!search) return null

  return (
    <form onSubmit={handleSubmit}>
      <button type='submit' disabled={isSubmitting}>
        Revalidate
      </button>
    </form>
  )
}

export { RevalidateForm }
