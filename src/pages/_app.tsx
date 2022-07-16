import React from 'react'

import '../styles/index.css'
import type { AppProps, NextWebVitalsMetric } from 'next/app'

// @ts-ignore
const App: React.FC<AppProps> = ({ Component, pageProps, err }) => (
  <Component {...pageProps} err={err} />
)

export function reportWebVitals({
  id,
  name,
  value,
  startTime
}: NextWebVitalsMetric) {
  // eslint-disable-next-line no-console
  console.log(`${name}: `, id, value, startTime) // The metric object ({ id, name, startTime, value, label }) is logged to the console
}

export default App
