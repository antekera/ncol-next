'use client'

import { createContext, useContext } from 'react'

import { AdsContextValue } from '../types'

export const AdsContext = createContext<AdsContextValue>(null)

export const useAdsContext = (): AdsContextValue => {
  const context = useContext(AdsContext)

  if (!context) {
    throw new Error(
      `[AdsContext]: You forgot to wrap your component with AdsProvider`
    )
  }

  return context
}
