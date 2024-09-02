'use client'

import { useEffect, useRef } from 'react'

import Script from 'next/script'

import { usePageStore } from '@lib/hooks/store'

export default function Template({
  children
}: {
  readonly children: React.ReactNode
}) {
  const { setPageSetupState } = usePageStore()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPageSetupState({
      contentHeight: ref.current?.clientHeight
    })
  }, [children])

  return (
    <>
      <Script
        async
        src='https://cdn.taboola.com/libtrc/noticiascol-noticiascol/loader.js'
        id='tb_loader_script'
        strategy='lazyOnload'
      />
      <div ref={ref}>{children}</div>
    </>
  )
}
