'use client'

import * as React from 'react'
import { Next13ProgressBar } from 'next13-progressbar'

export function NProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Next13ProgressBar
        height='4px'
        color='#1b75bb'
        options={{ showSpinner: true }}
        showOnShallow
      />
    </>
  )
}
