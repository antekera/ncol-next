import { MAIN_MENU, MENU, MENU_C } from '@lib/constants'

import { categoryName } from '..'

const description = 'should return "$expected" when have "$name" name'

describe('categoryName', () => {
  test.each`
    name             | expected
    ${MAIN_MENU[1]}  | ${'Noticias de la Costa Oriental'}
    ${MAIN_MENU[2]}  | ${'Noticias de Sucesos'}
    ${MAIN_MENU[3]}  | ${'Noticias Nacionales'}
    ${MAIN_MENU[4]}  | ${'Noticias de Economía'}
    ${MAIN_MENU[5]}  | ${'Noticias de Política'}
    ${MAIN_MENU[6]}  | ${'Noticias de Farándula'}
    ${MAIN_MENU[7]}  | ${'Noticias Internacionales'}
    ${MAIN_MENU[8]}  | ${'Noticias de Salud'}
    ${MAIN_MENU[9]}  | ${'Noticias de Curiosidades'}
    ${MAIN_MENU[10]} | ${'Noticias de Tecnología'}
    ${MAIN_MENU[11]} | ${'Noticias de Deportes'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  test.each`
    name        | expected
    ${MENU[1]}  | ${'Noticias de la Costa Oriental'}
    ${MENU[2]}  | ${'Noticias de Maracaibo'}
    ${MENU[3]}  | ${'Noticias de San Francisco'}
    ${MENU[4]}  | ${'Noticias de Baralt'}
    ${MENU[5]}  | ${'Noticias de Cabimas'}
    ${MENU[6]}  | ${'Noticias de Lagunillas'}
    ${MENU[7]}  | ${'Noticias de Miranda'}
    ${MENU[8]}  | ${'Noticias de Santa Rita'}
    ${MENU[9]}  | ${'Noticias de Simón Bolivar'}
    ${MENU[10]} | ${'Noticias de Valmore Rodriguez'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, true)).toBe(expected)
  })

  // test.each`
  //   name          | expected
  //   ${MENU_B[0]}  | ${'Noticias de Actualidad'}
  //   ${MENU_B[1]}  | ${'Noticias de Cultura'}
  //   ${MENU_B[2]}  | ${'Noticias de Cine'}
  //   ${MENU_B[3]}  | ${'Noticias de Curiosidades'}
  //   ${MENU_B[4]}  | ${'Noticias de Deportes'}
  //   ${MENU_B[5]}  | ${'Noticias de Economía'}
  //   ${MENU_B[6]}  | ${'Noticias de Educación'}
  //   ${MENU_B[7]}  | ${'Noticias de Especiales'}
  //   ${MENU_B[8]}  | ${'Noticias de Estilo de Vida'}
  //   ${MENU_B[9]}  | ${'Noticias de Farándula'}
  //   ${MENU_B[10]} | ${'Noticias de Gastronomía'}
  //   ${MENU_B[11]} | ${'Noticias Internacionales'}
  //   ${MENU_B[12]} | ${'Noticias de Internet'}
  //   ${MENU_B[13]} | ${'Noticias del Mundo'}
  //   ${MENU_B[14]} | ${'Noticias de Música'}
  //   ${MENU_B[15]} | ${'Noticias Nacionales'}
  //   ${MENU_B[16]} | ${'Noticias de Opinión'}
  //   ${MENU_B[17]} | ${'Noticias de Política'}
  //   ${MENU_B[18]} | ${'Noticias de Salud'}
  //   ${MENU_B[19]} | ${'Noticias de Sucesos'}
  //   ${MENU_B[20]} | ${'Noticias de Tecnología'}
  //   ${MENU_B[21]} | ${'Noticias de Televisión'}
  // `(description, ({ name, expected }) => {
  //   expect(categoryName(name, true)).toBe(expected)
  // })

  test.each`
    name         | expected
    ${MENU_C[0]} | ${'Contacto'}
    ${MENU_C[1]} | ${'Publicidad'}
    ${MENU_C[2]} | ${'Términos y Condiciones'}
  `(description, ({ name, expected }) => {
    expect(categoryName(name, false)).toBe(expected)
  })

  test('should return name only when prefix is false', () => {
    expect(categoryName('Costa Oriental', false)).toBe('Costa Oriental')
    expect(categoryName('Mundo', false)).toBe('Mundo')
    expect(categoryName('Nacionales', false)).toBe('Nacionales')
  })
})
