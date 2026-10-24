'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { isHomeV2PreviewPath } from '@lib/homeV2/preview'

/** V2 owns the same footer slot higher in its editorial flow. */
export function FooterAdSlot({
  publicHomeV2 = false,
  previewEnabled,
  auditEnabled
}: {
  publicHomeV2?: boolean
  previewEnabled: boolean
  auditEnabled: boolean
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (publicHomeV2 && (!pathname || pathname === '/')) return null

  // A rewritten URL can differ during hydration; keep local QA's fallback stable.
  if (previewEnabled && !mounted) return null
  const movedToHome =
    previewEnabled &&
    (isHomeV2PreviewPath(pathname ?? '') ||
      (auditEnabled &&
        pathname === '/' &&
        params?.get('__ncol_home_audit') === 'v2' &&
        !params.has('actualizar') &&
        ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)))
  return movedToHome ? null : (
    <NcolAdSlot slot='footer' className='flex justify-center py-2' />
  )
}
