import { MENU_B } from '@lib/constants'
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
    const expected = [
      '/categoria/nacionales/politica',
      '/categoria/tendencias/ciencia-y-tecnologia',
      '/categoria/entretenimiento/farandula',
      '/categoria/entretenimiento/curiosidades',
      '/categoria/entretenimiento/cine-y-tv',
      '/categoria/deportes/futbol',
      '/categoria/tendencias/gastronomia',
      '/categoria/tendencias/estilos-de-vida'
    ]
    expect(getStaticSlugs(MENU_B)).toEqual(expected)
  })
})
