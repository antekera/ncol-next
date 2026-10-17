'use client'

import { useState, type ReactNode } from 'react'
import type { OpeningTreatment } from '@lib/homeV2/types'
import styles from './HomeV2.module.css'

export function OpeningShell({
  treatment,
  children
}: {
  treatment: OpeningTreatment
  children: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  return (
    <section
      className={styles.opening}
      aria-label='Noticias de portada'
      data-module-id='opening'
      data-editorial-position='1'
      data-opening-treatment={failed ? 'traditional' : treatment}
      data-initial-treatment={treatment}
      onErrorCapture={event => {
        if (
          event.target instanceof HTMLImageElement &&
          event.target.dataset.homeCritical === 'true'
        )
          setFailed(true)
      }}
    >
      {children}
    </section>
  )
}
