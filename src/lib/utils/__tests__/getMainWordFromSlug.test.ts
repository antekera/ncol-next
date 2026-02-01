import { getMainWordFromSlug } from '..'

describe('getMainWordFromSlug', () => {
  test('get main words from slug', () => {
    expect(
      getMainWordFromSlug(
        'por-presunta-vinculacion-con-los-fraudes-de-la-cvg-detienen-a-exministro-y-ex-gobernador-de-trujillo-hugo-cabezas'
      )
    ).toBe('vinculacion exministro')
  })

  test('returns empty string for empty input', () => {
    expect(getMainWordFromSlug('')).toBe('')
    expect(getMainWordFromSlug(undefined)).toBe('')
  })

  test('returns original phrase if no words are longer than 3 chars', () => {
    expect(getMainWordFromSlug('abc-de-f')).toBe('abc-de-f')
  })
})
