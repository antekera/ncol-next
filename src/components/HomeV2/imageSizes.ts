// Match HomeV2.module.css: 1200px shell; desktop 24px gutters, 250px
// sidebar and 30px gap; tablet 20px gutters, 220px sidebar and 20px gap.
// Keep the critical hero declaration stable; other owners pass their context.
export const HERO_IMAGE_SIZES =
  '(min-width: 1200px) 549px, (min-width: 1024px) calc(64.2857vw - 222.4286px), (min-width: 768px) calc(100vw - 280px), calc(100vw - 32px)'

export const OPENING_SECONDARY_IMAGE_SIZES =
  '(min-width: 1200px) 305px, (min-width: 1024px) calc(35.7143vw - 123.5714px), (min-width: 768px) calc(33.3333vw - 100px), 92px'

export const REGIONAL_LEAD_IMAGE_SIZES =
  '(min-width: 1200px) 549px, (min-width: 1024px) calc(64.2857vw - 222.4286px), (min-width: 768px) calc(64.2857vw - 191.5714px), calc(100vw - 32px)'

// The first section has no divider. Subsequent columns reserve 15px padding
// and a 1px border; mobile sections use the full content width.
export const SECTION_LEAD_IMAGE_SIZES =
  '(min-width: 1200px) 276px, (min-width: 1024px) calc(33.3333vw - 124px), (min-width: 768px) calc(33.3333vw - 102.6667px), calc(100vw - 32px)'

export const DIVIDED_SECTION_LEAD_IMAGE_SIZES =
  '(min-width: 1200px) 260px, (min-width: 1024px) calc(33.3333vw - 140px), (min-width: 768px) calc(33.3333vw - 118.6667px), calc(100vw - 32px)'
