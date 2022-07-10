import { removeAccents } from '..'

describe('categoryName', () => {
  test.each`
    name            | expected
    ${'Música'}     | ${'Musica'}
    ${'tecnología'} | ${'tecnologia'}
  `('should normalize "$name" from given value', ({ name, expected }) => {
    expect(removeAccents(name)).toBe(expected)
  })
})
