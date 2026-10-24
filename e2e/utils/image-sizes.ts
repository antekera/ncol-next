import type { Locator } from '@playwright/test'

export const declaredImageWidth = (image: Locator) =>
  image.evaluate(el => {
    const declaration = (el.parentElement
      ?.querySelector('source')
      ?.getAttribute('sizes') ?? el.getAttribute('sizes'))!
    // Split clauses, preserving commas inside CSS functions such as min().
    const sizes: string[] = []
    let depth = 0
    let start = 0
    for (let index = 0; index < declaration.length; index++) {
      if (declaration[index] === '(') depth++
      else if (declaration[index] === ')') depth--
      else if (declaration[index] === ',' && depth === 0) {
        sizes.push(declaration.slice(start, index).trim())
        start = index + 1
      }
    }
    sizes.push(declaration.slice(start).trim())
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
