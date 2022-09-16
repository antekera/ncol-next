import { Ad } from '@blackbox-vision/next-google-dfp'
import cn from 'classnames'

import { AD_MANAGER_PREFIX } from '@lib/constants'

interface AdDfpSlotProps {
  id: string
  width?: number
  height?: number
  className?: string
  style?: any
}

const AdDfpSlot = ({ id, width, height, className, style }: AdDfpSlotProps) => {
  const classes = cn('bloque-adv', className)
  const tag = `${AD_MANAGER_PREFIX}-${id}`

  return (
    <div className={classes}>
      <Ad
        id={tag}
        width={width ? width : 'inherit'}
        height={height ? height : 'inherit'}
        className='ad-slot'
        style={style}
      />
    </div>
  )
}

export { AdDfpSlot }
