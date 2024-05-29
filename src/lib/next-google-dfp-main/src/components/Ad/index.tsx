'use client'

import { useEffect } from 'react'

import { dfp } from '@lib/next-google-dfp-main/src/apis/dfp'
import { useAdsContext } from '@lib/next-google-dfp-main/src/contexts/ads'
import { AdComponent } from '@lib/next-google-dfp-main/src/types'
import { isProd } from '@lib/utils/env'

const isProduction = isProd()

export const Ad: AdComponent = ({ id, className, style = {} }) => {
  const { isLoading } = useAdsContext() ?? {}

  useEffect(() => {
    if (!isLoading && !!id && isProduction) {
      dfp.showSlot(id)
    }
  }, [isLoading, id])

  return (
    <div
      id={id}
      className={className}
      style={{
        ...style
      }}
    />
  )
}
