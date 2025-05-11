import { MAIN_MENU, MENU, MENU_B, MENU_C } from '@lib/constants'
import { categoryName } from '..'

const description = 'should return "$expected" when have "$name" name'

describe('categoryName', () => {
  test.each`
    name                 | expected
    ${MAIN_MENU[0].name} | ${'Noticias del Zulia'}
    ${MAIN_MENU[1].name} | ${'Noticias Nacionales'}
    ${MAIN_MENU[2].name} | ${'Noticias Internacionales'}
    ${MAIN_MENU[3].name} | ${'Noticias de Deportes'}
    ${MAIN_MENU[4].name} | ${'Noticias de Tendencias'}
    ${MAIN_MENU[5].name} | ${'Noticias de Entretenimiento'}
    ${MAIN_MENU[6].name} | ${'Noticias de Salud'}
    ${MAIN_MENU[7].name} | ${'Noticias de Sucesos'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name            | expected
    ${MENU[1].name} | ${'Noticias del Zulia'}
    ${MENU[2].name} | ${'Noticias Nacionales'}
    ${MENU[3].name} | ${'Noticias Internacionales'}
    ${MENU[4].name} | ${'Noticias de Deportes'}
    ${MENU[5].name} | ${'Noticias de Tendencias'}
    ${MENU[6].name} | ${'Noticias de Entretenimiento'}
    ${MENU[7].name} | ${'Noticias de Salud'}
    ${MENU[8].name} | ${'Noticias de Sucesos'}
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
    ${MENU_B[5].name} | ${'Noticias de Efemérides'}
    ${MENU_B[6].name} | ${'Noticias de Futbol'}
    ${MENU_B[7].name} | ${'Noticias de Gastronomía'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name              | expected
    ${MENU_C[0].name} | ${'Contacto'}
    ${MENU_C[1].name} | ${'Publicidad'}
    ${MENU_C[2].name} | ${'Términos y Condiciones'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, false)).toBe(expected)
  })

  test('should return name only when prefix is false', () => {
    expect(categoryName('Costa Oriental', false)).toBe('Costa Oriental')
    expect(categoryName('Mundo', false)).toBe('Mundo')
    expect(categoryName('Nacionales', false)).toBe('Nacionales')
  })
})
