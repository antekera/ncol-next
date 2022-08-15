import { useEffect } from 'react'

export const useDfpSlots = (tag: string) => {
  useEffect(() => {
    // @ts-ignore
    if (window && window.googletag) {
      // @ts-ignore
      const googletag = window.googletag || {}
      googletag.cmd.push(function () {
        googletag.display(tag)
      })
    }
  }, [tag])
}
