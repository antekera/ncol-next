import {
  isHomeV2PreviewEnabled,
  isHomeV2PerformanceAuditEnabled,
  prepareHomeV2Preview
} from '../preview'
import type { HomeV2Data } from '../types'
it.each([
  [{}, false],
  [{ HOME_V2_PREVIEW_ENABLED: 'false' }, false],
  [{ HOME_V2_PREVIEW_ENABLED: 'true' }, true],
  [{ HOME_V2_PREVIEW_ENABLED: 'true', VERCEL_ENV: 'production' }, false],
  [{ HOME_V2_PREVIEW_ENABLED: 'true', VERCEL_ENV: 'preview' }, false],
  [{ HOME_V2_PREVIEW_ENABLED: 'true', VERCEL: '1' }, false]
])('only enables an explicitly requested local QA preview', (env, expected) => {
  expect(isHomeV2PreviewEnabled(env)).toBe(expected)
})
it.each([
  [{ HOME_V2_PERFORMANCE_AUDIT: 'true' }, false],
  [{ HOME_V2_PREVIEW_ENABLED: 'true' }, false],
  [
    { HOME_V2_PREVIEW_ENABLED: 'true', HOME_V2_PERFORMANCE_AUDIT: 'true' },
    true
  ],
  [
    {
      HOME_V2_PREVIEW_ENABLED: 'true',
      HOME_V2_PERFORMANCE_AUDIT: 'true',
      VERCEL: '1'
    },
    false
  ]
])(
  'allows equivalent-script audit only in an explicit local preview',
  (env, expected) => {
    expect(isHomeV2PerformanceAuditEnabled(env)).toBe(expected)
  }
)
it('can exercise the automatic no-photo layout locally without altering cached editorial data', () => {
  const data: HomeV2Data = {
    featured: {
      id: 'post',
      uri: '/2026/10/17/post/',
      title: 'News',
      categories: { edges: [] },
      featuredImage: {
        node: { sourceUrl: 'https://cdn.noticiascol.com/news.jpg' }
      }
    },
    sections: {},
    regions: [],
    errors: []
  }
  const local = {
    HOME_V2_PREVIEW_ENABLED: 'true',
    HOME_V2_PREVIEW_TREATMENT: 'traditional'
  }
  expect(prepareHomeV2Preview(data, local).featured?.featuredImage).toBeNull()
  expect(data.featured?.featuredImage).not.toBeNull()
  expect(prepareHomeV2Preview(data, {})).toBe(data)
  expect(prepareHomeV2Preview(data, { ...local, VERCEL: '1' })).toBe(data)
})
