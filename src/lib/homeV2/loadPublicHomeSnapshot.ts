import { categoriesClient, postsClient } from '@lib/api'
import { loadHomeTaxonomies, loadHomeV2Snapshot } from './loadHomeV2Data'
import { HOME_V2_SECTIONS } from './sections'

export async function loadPublicHomeSnapshot() {
  // One taxonomy load and one grouped editorial load per admitted refresh.
  // This producer is independent of Next's render cache and visitor traffic.
  const categories = await loadHomeTaxonomies(categoriesClient)
  if (!categories) throw new Error('Home taxonomies unavailable')
  const fetchedAt = Date.now()
  const data = await loadHomeV2Snapshot(
    { categories: categoriesClient, posts: postsClient },
    HOME_V2_SECTIONS,
    categories
  )
  if (data.errors.length) throw new Error('Home editorial snapshot incomplete')
  return { data, fetchedAt }
}
