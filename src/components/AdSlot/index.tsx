import cn from 'classnames'

import { useDfpSlots } from '@lib/hooks/useDfpSlots'

interface GAdsScriptProps {
  id: string
  className?: string
}

const AdSlot = ({ id, className }: GAdsScriptProps) => {
  const classes = cn('mb-4 bloque-adv', className)

  const tag = `div-gpt-ad-${id}`
  useDfpSlots(tag)

  return <div id={tag} className={classes} />
}

export { AdSlot }
