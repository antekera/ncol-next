/**
 * Feature flags and global configuration for ncol-next.
 * Toggle values here to enable/disable features without touching component code.
 */

/**
 * When true: ad slots fetch active ads from Supabase (rest/v1/ads) and render them.
 * When false: no request is made and all ad slots render nothing (or placeholder
 * if ADS_PLACEHOLDER_MODE is on via the ?ver-banners URL param).
 */
export const ADS_ENABLED = true

/**
 * When true: the header ad slot reserves its full height even before the ad
 * image has loaded, preventing layout shift / LCP degradation.
 * When false: the header slot is completely hidden when no ad is present.
 */
export const RESERVE_HEADER_HEIGHT = false
