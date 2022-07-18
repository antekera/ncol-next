import { titleFromSlug } from '..'

describe('titleFromSlug', () => {
  test.each`
    name                | expected
    ${'costa-oriental'} | ${'Costa Oriental'}
    ${'musica'}         | ${'Música'}
    ${'tecnologia'}     | ${'Tecnología'}
    ${'farandula'}      | ${'Farándula'}
    ${'simon-bolivar'}  | ${'Simón Bolivar'}
  `(
    'should convert slug "$name" to title from given value',
    ({ name, expected }) => {
      expect(titleFromSlug(name)).toBe(expected)
    }
  )
})
