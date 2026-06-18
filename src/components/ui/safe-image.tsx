'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/**
 * Wraps next/image and hides itself when the source image is missing or
 * returns an error (e.g. 403/404 from S3). The parent container remains
 * in the DOM but the image element is removed, avoiding broken-image icons.
 */
export function SafeImage({ onError, ...props }: ImageProps) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  return (
    <Image
      {...props}
      onError={e => {
        setHidden(true)
        onError?.(e)
      }}
    />
  )
}
