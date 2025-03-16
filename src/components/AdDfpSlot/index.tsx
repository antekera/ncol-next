import { Ad } from '@lib/next-google-dfp-main/src'
import { cn } from '@lib/shared'
import { isDev } from '@lib/utils'

interface AdDfpSlotProps {
  id: string | undefined
  className?: string
  style: React.CSSProperties
}

const isDevelopment = isDev()

const AdDfpSlot = ({ id, className, style }: AdDfpSlotProps) => {
  const classes = cn('bloque-adv', className)

  if (!id) return null

  return (
    <div className={classes}>
      <Ad
        id={id}
        className='ad-slot'
        style={{
          ...style,
          backgroundColor: isDevelopment ? '#f1f5f9' : 'transparent'
        }}
      />
    </div>
  )
}

export { AdDfpSlot }
