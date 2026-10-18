import type { Locator } from '@playwright/test'

export const declaredImageWidth = (image: Locator) =>
  image.evaluate(el => {
    const sizes = (el.parentElement
      ?.querySelector('source')
      ?.getAttribute('sizes') ?? el.getAttribute('sizes'))!
      .split(',')
      .map(value => value.trim())
    let length = sizes.at(-1)!
    for (const clause of sizes) {
      const match = clause.match(/^(\([^)]*\))\s+(.+)$/)
      if (match && matchMedia(match[1]).matches) {
        length = match[2]
        break
      }
    }
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;visibility:hidden;height:0;border:0;padding:0;'
    probe.style.width = length
    document.body.appendChild(probe)
    const declared = probe.getBoundingClientRect().width
    probe.remove()
    return { declared, actual: el.getBoundingClientRect().width }
  })
