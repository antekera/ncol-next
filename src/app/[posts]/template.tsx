'use client'
import { useEffect, useRef } from 'react'
import * as React from 'react'

import { usePageStore } from '@lib/hooks/store'

export default function Template({ children }: { children: React.ReactNode }) {
  const { setPageSetupState } = usePageStore()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPageSetupState({
      contentHeight: ref.current?.clientHeight
    })
  }, [children])
  return (
    <div className='border outline' ref={ref}>
      {children}
    </div>
  )
}
