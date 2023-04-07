import { getMainWordFromSlug } from '..'

describe('getMainWordFromSlug', () => {
  test('get main words from slug', () => {
    expect(
      getMainWordFromSlug(
        'por-presunta-vinculacion-con-los-fraudes-de-la-cvg-detienen-a-exministro-y-ex-gobernador-de-trujillo-hugo-cabezas'
      )
    ).toBe('vinculacion')
  })
})
