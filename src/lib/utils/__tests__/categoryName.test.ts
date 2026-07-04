import { MENU_B, MENU_C } from '@lib/constants'
import { categoryName } from '..'

const description = 'should return "$expected" when have "$name" name'

describe('categoryName', () => {
  test.each`
    name                 | expected
    ${'Sucesos'}         | ${'Noticias de Sucesos'}
    ${'Zulia'}           | ${'Noticias del Zulia'}
    ${'Nacionales'}      | ${'Noticias Nacionales'}
    ${'Internacionales'} | ${'Noticias Internacionales'}
    ${'Deportes'}        | ${'Noticias de Deportes'}
    ${'Mundial 2026'}    | ${'Noticias del Mundial 2026'}
    ${'Tendencias'}      | ${'Noticias de Tendencias'}
    ${'Entretenimiento'} | ${'Noticias de Entretenimiento'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name                 | expected
    ${'Sucesos'}         | ${'Noticias de Sucesos'}
    ${'Zulia'}           | ${'Noticias del Zulia'}
    ${'Nacionales'}      | ${'Noticias Nacionales'}
    ${'Internacionales'} | ${'Noticias Internacionales'}
    ${'Deportes'}        | ${'Noticias de Deportes'}
    ${'Mundial 2026'}    | ${'Noticias del Mundial 2026'}
    ${'Tendencias'}      | ${'Noticias de Tendencias'}
    ${'Entretenimiento'} | ${'Noticias de Entretenimiento'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name              | expected
    ${MENU_B[0].name} | ${'Noticias de Política'}
    ${MENU_B[1].name} | ${'Noticias de Ciencia y Tecnología'}
    ${MENU_B[2].name} | ${'Noticias de Farándula'}
    ${MENU_B[3].name} | ${'Noticias de Curiosidades'}
    ${MENU_B[4].name} | ${'Noticias de Cine y TV'}
    ${MENU_B[5].name} | ${'Noticias de Futbol'}
    ${MENU_B[6].name} | ${'Noticias de Gastronomía'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name              | expected
    ${MENU_C[0].name} | ${'Quiénes Somos'}
    ${MENU_C[1].name} | ${'Contactos'}
    ${MENU_C[2].name} | ${'Términos y Condiciones'}
    ${MENU_C[3].name} | ${'Privacidad'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, false)).toBe(expected)
  })

  test.each`
    name                 | expected
    ${'Sucesos'}         | ${'Noticias de Sucesos'}
    ${'Zulia'}           | ${'Noticias del Zulia'}
    ${'Nacionales'}      | ${'Noticias Nacionales'}
    ${'Internacionales'} | ${'Noticias Internacionales'}
    ${'Deportes'}        | ${'Noticias de Deportes'}
    ${'Mundial 2026'}    | ${'Noticias del Mundial 2026'}
    ${'Tendencias'}      | ${'Noticias de Tendencias'}
    ${'Entretenimiento'} | ${'Noticias de Entretenimiento'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test('should return name only when prefix is false', () => {
    expect(categoryName('Costa Oriental', false)).toBe('Costa Oriental')
    expect(categoryName('Mundo', false)).toBe('Mundo')
    expect(categoryName('Nacionales', false)).toBe('Nacionales')
  })
})
