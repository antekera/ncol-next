import { cn } from '@lib/shared'
import { isDev } from '@lib/utils/env'
import { ClassValue } from 'clsx'

export const getAdSenseBannerClasses = (className?: ClassValue) =>
  cn(
    'p-2',
    isDev
      ? 'bg-neutral-100 dark:bg-neutral-600'
      : 'adsbygoogle adbanner-customize',
    className
  )
