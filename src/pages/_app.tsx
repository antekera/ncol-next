import React from 'react'

import '../styles/index.css'
import type { AppProps, NextWebVitalsMetric } from 'next/app'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export function reportWebVitals({
  id,
  name,
  value,
  startTime,
}: NextWebVitalsMetric) {
  // eslint-disable-next-line no-console
  console.log(`${name}: `, id, value.toFixed(2), startTime.toFixed(2)) // The metric object ({ id, name, startTime, value, label }) is logged to the console
}

export default MyApp
