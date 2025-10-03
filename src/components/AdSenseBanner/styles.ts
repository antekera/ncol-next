import { cn } from '@lib/shared'
import { isDev } from '@lib/utils/env'
import { ClassValue } from 'clsx'

export const getAdSenseBannerClasses = (className?: ClassValue) =>
  cn(isDev ? '' : 'adsbygoogle adbanner-customize', className)
