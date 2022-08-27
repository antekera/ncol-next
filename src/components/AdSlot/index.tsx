import { useEffect } from 'react'

import cn from 'classnames'

interface GAdsScriptProps {
  id: string
  className?: string
}

const AdSlot = ({ id, className }: GAdsScriptProps) => {
  const classes = cn('mb-4 bloque-adv', className)
  const tag = `div-gpt-ad-${id}`

  useEffect(() => {
    // @ts-ignore
    if (window && window.googletag) {
      // @ts-ignore
      googletag.cmd.push(function () {
        // @ts-ignore
        googletag.display(tag)
      })
    }
  }, [tag])

  return <div id={tag} className={classes} />
}

export { AdSlot }
