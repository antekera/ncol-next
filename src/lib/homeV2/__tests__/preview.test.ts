import { isHomeV2PreviewEnabled } from '../preview'
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
