'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

const CDN_HOST = 'cdn.noticiascol.com'
const DEFAULT_FALLBACK_SRC = '/media/logo-plain.png'

type SafeImageProps = ImageProps & {
  fallbackSrc?: string
}

/**
 * Wraps next/image and swaps to a local fallback when the remote source is
 * missing (e.g. 403/404 from legacy S3-backed CDN images). For the
 * `cdn.noticiascol.com` origin we also bypass Next's image optimizer so the
 * server doesn't emit upstream fetch errors on every request.
 */
export function SafeImage({
  onError,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  src,
  unoptimized,
  ...props
}: SafeImageProps) {
  const [hidden, setHidden] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  if (hidden) return null

  const shouldBypassOptimization =
    typeof currentSrc === 'string' && currentSrc.includes(CDN_HOST)

  return (
    <Image
      {...props}
      src={currentSrc}
      unoptimized={shouldBypassOptimization || unoptimized}
      onError={e => {
        if (typeof currentSrc === 'string' && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        } else {
          setHidden(true)
        }
        onError?.(e)
      }}
    />
  )
}
