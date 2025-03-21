'use client'

import { useEffect, useRef } from 'react'

import Script from 'next/script'

import ContextStateData from '@lib/context/StateContext'

export default function Template({
  children
}: {
  readonly children: React.ReactNode
}) {
  const { handleSetContext } = ContextStateData()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    handleSetContext({
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
