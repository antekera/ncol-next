// Match the shared Container: desktop widths 64/80/96rem and 1.75rem
// side padding. min() also handles an enlarged root font and narrow viewports.
// Home V2 retains its 250px desktop sidebar/30px gap, 220px tablet sidebar/
// 20px gap and 16px mobile gutters. Only the hero is prioritized.
const columnSize = (containerRem: number, fraction: number, insetPx: number) =>
  `calc(min(${(100 * fraction).toFixed(6)}vw, ${(containerRem * fraction).toFixed(6)}rem) - ${(3.5 * fraction).toFixed(6)}rem - ${(insetPx * fraction).toFixed(6)}px)`

const desktopSizes = (fraction: number, insetPx: number, coverRem?: number) =>
  [96, 80, 64]
    .map(width => {
      const column = columnSize(width, fraction, insetPx)
      const size = coverRem
        ? `max(${column}, ${coverRem.toFixed(6)}rem)`
        : column
      return `(min-width: ${width}rem) ${size}`
    })
    .join(', ')

const mobileSize = 'calc(100vw - 32px)'

export const HERO_IMAGE_SIZES = `${desktopSizes(9 / 14, 250 + 30 + 18)}, (min-width: 48rem) ${columnSize(48, 1, 220 + 20)}, ${mobileSize}`

// Match the overlay's 34rem desktop / 32rem mobile minimum heights. Account
// for cover cropping so a tall panel never stretches a tiny mobile derivative.
export function photographicHeroSizes(aspectRatio: number) {
  const desktopCover = 34 * aspectRatio
  const mobileCover = 32 * aspectRatio
  return `${desktopSizes(9 / 14, 250 + 30 + 18, desktopCover)}, (min-width: 48rem) max(${columnSize(48, 1, 220 + 20)}, ${desktopCover.toFixed(6)}rem), max(${mobileSize}, ${mobileCover.toFixed(6)}rem)`
}

export const OPENING_SECONDARY_IMAGE_SIZES = `${desktopSizes(5 / 14, 250 + 30 + 18)}, (min-width: 48rem) ${columnSize(48, 1 / 3, 220 + 20 + 20)}, 92px`

export const REGIONAL_LEAD_IMAGE_SIZES = `${desktopSizes(9 / 14, 250 + 30 + 18)}, (min-width: 48rem) ${columnSize(48, 9 / 14, 220 + 20 + 18)}, ${mobileSize}`

// Three columns: two 22px desktop / 14px tablet gaps. Divided columns also
// reserve 15px padding and a 1px border, hence 3 * 16 additional inset pixels.
export const SECTION_LEAD_IMAGE_SIZES = `${desktopSizes(1 / 3, 250 + 30 + 44)}, (min-width: 48rem) ${columnSize(48, 1 / 3, 220 + 20 + 28)}, ${mobileSize}`

export const DIVIDED_SECTION_LEAD_IMAGE_SIZES = `${desktopSizes(1 / 3, 250 + 30 + 44 + 48)}, (min-width: 48rem) ${columnSize(48, 1 / 3, 220 + 20 + 28 + 48)}, ${mobileSize}`
