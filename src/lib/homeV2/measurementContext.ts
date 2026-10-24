/** Public editorial context only. Reader identity remains owned by existing GA4. */
export interface HomeEventContext {
  home_version?: 'current' | 'v2'
  home_view_id?: string
  opening_treatment?: 'current' | 'photographic' | 'traditional'
  module_id?: string
  editorial_position?: number
  item_position?: number
  article_id?: string
  origin_article_id?: string
  section_id?: string
  component_type?: string
  region_id?: string
  visibility_rule?: 'visible_v1'
  service_id?: string
  direction?: 'previous' | 'next'
  video_provider?: 'youtube' | 'dailymotion'
  video_id?: string
  from_item_position?: number
  to_item_position?: number
  navigation_method?: 'arrow' | 'gesture'
  first_article_id?: string
  active_reading_seconds?: number
  web_vital_name?: 'LCP' | 'INP' | 'CLS'
  web_vital_value?: number
  web_vital_delta?: number
  web_vital_id?: string
  web_vital_revision?: number
  web_vital_unit?: 'ms' | 'score'
  web_vital_rating?: 'good' | 'needs-improvement' | 'poor'
  web_vital_navigation?:
    | 'navigate'
    | 'reload'
    | 'prerender'
    | 'back-forward'
    | 'restore'
    | 'soft-navigation'
    | 'back-forward-cache'
  web_vital_scope?: 'document' | 'soft-navigation' | 'back-forward-cache'
  web_vital_environment?: 'local-qa'
  lcp_element_role?: 'editorial' | 'advertisement' | 'other' | 'unknown'
}

// GTM's data model persists fields between pushes. Reset only our scoped fields
// after processing the enriched event; never reset the existing container model.
const editorialKeys = [
  'home_version',
  'home_view_id',
  'opening_treatment',
  'module_id',
  'editorial_position',
  'item_position',
  'article_id',
  'origin_article_id',
  'section_id',
  'component_type',
  'region_id',
  'visibility_rule',
  'service_id',
  'direction',
  'video_provider',
  'video_id',
  'from_item_position',
  'to_item_position',
  'navigation_method',
  'first_article_id',
  'active_reading_seconds',
  'web_vital_name',
  'web_vital_value',
  'web_vital_delta',
  'web_vital_id',
  'web_vital_revision',
  'web_vital_unit',
  'web_vital_rating',
  'web_vital_navigation',
  'web_vital_scope',
  'web_vital_environment',
  'lcp_element_role'
] as const satisfies readonly (keyof HomeEventContext)[]

// Clear obsolete QA fields as well; they must not survive in GTM's model.
export const HOME_MEASUREMENT_KEYS = [
  ...editorialKeys,
  'experiment_id',
  'home_variant'
] as const
