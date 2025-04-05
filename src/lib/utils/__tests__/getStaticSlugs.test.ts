import { slugify, getStaticSlugs } from '../getStaticSlugs'

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('should remove special characters', () => {
    expect(slugify('hello! @world#')).toBe('hello-world')
  })

  it('should remove accents', () => {
    expect(slugify('económía')).toBe('economia')
  })

  it('should handle multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('should trim spaces', () => {
    expect(slugify(' hello world ')).toBe('hello-world')
  })
})

describe('getStaticSlugs', () => {
  it('should return empty array when no items provided', () => {
    expect(getStaticSlugs()).toEqual([])
  })

  it('should convert array of strings to slugs', () => {
    const input = ['Hello World', 'Términos y Condiciones', 'ECONOMÍA']
    const expected = ['hello-world', 'terminos-y-condiciones', 'economia']
    expect(getStaticSlugs(input)).toEqual(expected)
  })

  it('should handle empty strings', () => {
    expect(getStaticSlugs(['', ' '])).toEqual(['', ''])
  })

  it('should handle special characters and accents in array', () => {
    const input = ['Simón Bolívar', 'San Francisco!', 'Costa @Oriental']
    const expected = ['simon-bolivar', 'san-francisco', 'costa-oriental']
    expect(getStaticSlugs(input)).toEqual(expected)
  })
})
