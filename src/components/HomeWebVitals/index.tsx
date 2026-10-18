'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { reportHomeWebVital } from '@lib/homeV2/vitals'

/** One persistent layout mount; the callback and its exposure ledger are stable. */
export function HomeWebVitals() {
  useReportWebVitals(reportHomeWebVital)
  return null
}
