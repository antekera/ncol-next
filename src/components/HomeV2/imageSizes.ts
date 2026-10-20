// Match the shared Container: desktop widths 64/80/96rem and 1.75rem
// side padding. min() also handles an enlarged root font and narrow viewports.
// Keep the fixed sidebar/gutter geometry and mirror the rem-based editorial
// gaps. Below 1280px category modules stack; regional modules stack below 1024px.
const columnSize = (
  containerRem: number,
  fraction: number,
  insetPx: number,
  insetRem = 0
) =>
  `calc(min(${(100 * fraction).toFixed(6)}vw, ${(containerRem * fraction).toFixed(6)}rem) - ${((3.5 + insetRem) * fraction).toFixed(6)}rem - ${(insetPx * fraction).toFixed(6)}px)`

const desktopSizes = (
  fraction: number,
  insetPx: number,
  insetRem = 0,
  {
    coverRem,
    minimumContainerRem = 64
  }: { coverRem?: number; minimumContainerRem?: number } = {}
) =>
  [96, 80, 64]
    .filter(width => width >= minimumContainerRem)
    .map(width => {
      const column = columnSize(width, fraction, insetPx, insetRem)
      const size = coverRem
        ? `max(${column}, ${coverRem.toFixed(6)}rem)`
        : column
      return `(min-width: ${width}rem) ${size}`
    })
    .join(', ')

const mobileSize = 'calc(100vw - 32px)'

export const HERO_IMAGE_SIZES = `${desktopSizes(9 / 14, 250 + 30, 1.5)}, (min-width: 48rem) ${columnSize(48, 1, 220 + 20)}, ${mobileSize}`

// Match the overlay's 34rem desktop / 32rem mobile minimum heights. Account
// for cover cropping so a tall panel never stretches a tiny mobile derivative.
export function photographicHeroSizes(aspectRatio: number) {
  const desktopCover = 34 * aspectRatio
  const mobileCover = 32 * aspectRatio
  return `${desktopSizes(9 / 14, 250 + 30, 1.5, { coverRem: desktopCover })}, (min-width: 48rem) max(${columnSize(48, 1, 220 + 20)}, ${desktopCover.toFixed(6)}rem), max(${mobileSize}, ${mobileCover.toFixed(6)}rem)`
}

export const OPENING_SECONDARY_IMAGE_SIZES = `${desktopSizes(5 / 14, 250 + 30, 1.5)}, (min-width: 48rem) ${columnSize(48, 1 / 3, 220 + 20, 2)}, 92px`

export const REGIONAL_LEAD_IMAGE_SIZES = `${desktopSizes(9 / 14, 250 + 30, 1.5)}, (min-width: 48rem) ${columnSize(48, 1, 220 + 20)}, ${mobileSize}`

// Desktop has two 2rem gaps. Divided columns add 1.5rem padding and a
// 1px border; multiplying their inset by three offsets a single column.
export const SECTION_LEAD_IMAGE_SIZES = `${desktopSizes(1 / 3, 250 + 30, 4, { minimumContainerRem: 80 })}, (min-width: 64rem) ${columnSize(64, 1, 250 + 30)}, (min-width: 48rem) ${columnSize(48, 1, 220 + 20)}, ${mobileSize}`

export const DIVIDED_SECTION_LEAD_IMAGE_SIZES = `${desktopSizes(1 / 3, 250 + 30 + 3, 8.5, { minimumContainerRem: 80 })}, (min-width: 64rem) ${columnSize(64, 1, 250 + 30)}, (min-width: 48rem) ${columnSize(48, 1, 220 + 20)}, ${mobileSize}`
