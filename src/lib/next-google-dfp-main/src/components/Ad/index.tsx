'use client'

import { useEffect } from 'react'

import { dfp } from '@lib/next-google-dfp-main/src/apis/dfp'
import { useAdsContext } from '@lib/next-google-dfp-main/src/contexts/ads'
import { AdComponent } from '@lib/next-google-dfp-main/src/types'

export const Ad: AdComponent = ({
  id,
  className,
  style = {},
  width = 350,
  height = 250
}) => {
  const { isLoading } = useAdsContext() ?? {}

  useEffect(() => {
    if (!isLoading && !!id) {
      dfp.showSlot(id)
    }
  }, [isLoading, id])

  return (
    <div
      id={id}
      className={className}
      style={{
        ...style,
        width,
        height
      }}
    />
  )
}
