'use client'

import { useEffect, useRef } from 'react'

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
  }, [children, handleSetContext])

  return <div ref={ref}>{children}</div>
}
