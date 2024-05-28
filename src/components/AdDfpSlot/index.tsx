import cn from 'classnames'

import { Ad } from '@lib/next-google-dfp-main/src'
import { isDev } from '@lib/utils'

interface AdDfpSlotProps {
  id: string | undefined
  width?: number
  height?: number
  className?: string
  style?: any
}

const AdDfpSlot = ({ id, width, height, className, style }: AdDfpSlotProps) => {
  const classes = cn('bloque-adv', className)

  if (!id || isDev()) return null

  return (
    <div className={classes} style={style}>
      <Ad
        id={id}
        width={width ?? 'inherit'}
        height={height ?? 'inherit'}
        className='ad-slot'
        style={{ width: 'inherit', height: 'inherit' }}
      />
    </div>
  )
}

export { AdDfpSlot }
