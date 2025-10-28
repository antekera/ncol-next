export const env = {
  baseURL:
    process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
  homeCount: parseInt(process.env.E2E_HOME_EXPECT_COUNT || '') || undefined,
  categorySlug: process.env.E2E_CATEGORY_SLUG,
  categoryCount:
    parseInt(process.env.E2E_CATEGORY_EXPECT_COUNT || '') || undefined,
  tagSlug: process.env.E2E_TAG_SLUG,
  tagCount: parseInt(process.env.E2E_TAG_EXPECT_COUNT || '') || undefined,
  postPath: process.env.E2E_POST_PATH,
  postTitle: process.env.E2E_POST_TITLE,
  searchTerm: process.env.E2E_SEARCH_TERM || 'noticias',
  searchCount: parseInt(process.env.E2E_SEARCH_EXPECT_COUNT || '') || undefined,
  sidebarMostReadCount:
    parseInt(process.env.E2E_SIDEBAR_MAS_LEIDOS_EXPECT_COUNT || '') ||
    undefined,
  sidebarMostViewedCount:
    parseInt(process.env.E2E_SIDEBAR_MAS_VISTO_EXPECT_COUNT || '') || undefined
}
