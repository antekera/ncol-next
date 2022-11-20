import { Ad } from '@blackbox-vision/next-google-dfp'
import cn from 'classnames'

interface AdDfpSlotProps {
  id: string | undefined
  width?: number
  height?: number
  className?: string
  style?: any
}

const AdDfpSlot = ({ id, width, height, className, style }: AdDfpSlotProps) => {
  const classes = cn('bloque-adv', className)

  if (!id) return null

  return (
    <div className={classes} style={style}>
      <Ad
        id={id}
        width={width ? width : 'inherit'}
        height={height ? height : 'inherit'}
        className='ad-slot'
        style={{ width: 'inherit', height: 'inherit' }}
      />
    </div>
  )
}

export { AdDfpSlot }
