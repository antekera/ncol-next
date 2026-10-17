/** Public editorial context only. Reader identity remains owned by existing GA4. */
export interface HomeEventContext {
  experiment_id?: 'home_v2'
  home_variant?: 'control' | 'v2'
  home_view_id?: string
  opening_treatment?: 'current' | 'photographic' | 'traditional'
  module_id?: string
  editorial_position?: number
  item_position?: number
  article_id?: string
  section_id?: string
  component_type?: string
  region_id?: string
  visibility_rule?: 'visible_v1'
  service_id?: string
  direction?: 'previous' | 'next'
  first_article_id?: string
  active_reading_seconds?: number
}

// GTM's data model persists fields between pushes. Reset only our scoped fields
// after processing the enriched event; never reset the existing container model.
export const HOME_MEASUREMENT_KEYS = [
  'experiment_id',
  'home_variant',
  'home_view_id',
  'opening_treatment',
  'module_id',
  'editorial_position',
  'item_position',
  'article_id',
  'section_id',
  'component_type',
  'region_id',
  'visibility_rule',
  'service_id',
  'direction',
  'first_article_id',
  'active_reading_seconds'
] as const satisfies readonly (keyof HomeEventContext)[]
