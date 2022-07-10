import { MAIN_MENU, MENU, MENU_B, MENU_C } from '@lib/constants'

import { categoryName } from '..'

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
  `(
    'should return "$expected" when have "$name" name',
    ({ name, expected }) => {
      expect(categoryName(name, true)).toBe(expected)
    }
  )

  test.each`
    name        | expected
    ${MENU[1]}  | ${'Noticias de la Costa Oriental'}
    ${MENU[2]}  | ${'Noticias de Maracaibo'}
    ${MENU[3]}  | ${'Noticias de San Francisco'}
    ${MENU[4]}  | ${'Noticias de Baralt'}
    ${MENU[5]}  | ${'Noticias de Cabimas'}
    ${MENU[6]}  | ${'Noticias de Ciudad Ojeda'}
    ${MENU[7]}  | ${'Noticias de Lagunillas'}
    ${MENU[8]}  | ${'Noticias de Miranda'}
    ${MENU[9]}  | ${'Noticias de Santa Rita'}
    ${MENU[10]} | ${'Noticias de Simón Bolivar'}
    ${MENU[11]} | ${'Noticias de Valmore Rodriguez'}
  `(
    'should return "$expected" when have "$name" name',
    ({ name, expected }) => {
      expect(categoryName(name, true)).toBe(expected)
    }
  )

  test.each`
    name          | expected
    ${MENU_B[0]}  | ${'Noticias de Actualidad'}
    ${MENU_B[1]}  | ${'Noticias de Cultura'}
    ${MENU_B[2]}  | ${'Noticias de Ciencia'}
    ${MENU_B[3]}  | ${'Noticias de Cine'}
    ${MENU_B[4]}  | ${'Noticias de Curiosidades'}
    ${MENU_B[5]}  | ${'Noticias de Deportes'}
    ${MENU_B[6]}  | ${'Noticias de Economía'}
    ${MENU_B[7]}  | ${'Noticias de Educación'}
    ${MENU_B[8]}  | ${'Noticias de Entretenimiento'}
    ${MENU_B[9]}  | ${'Noticias de Especiales'}
    ${MENU_B[10]} | ${'Noticias de Estilo de Vida'}
    ${MENU_B[11]} | ${'Noticias de Farándula'}
    ${MENU_B[12]} | ${'Noticias de Gastronomía'}
    ${MENU_B[13]} | ${'Noticias Internacionales'}
    ${MENU_B[14]} | ${'Noticias de Internet'}
    ${MENU_B[15]} | ${'Noticias del Mundo'}
    ${MENU_B[16]} | ${'Noticias de Música'}
    ${MENU_B[17]} | ${'Noticias Nacionales'}
    ${MENU_B[18]} | ${'Noticias de Opinión'}
    ${MENU_B[19]} | ${'Noticias de Política'}
    ${MENU_B[20]} | ${'Noticias de Salud'}
    ${MENU_B[21]} | ${'Noticias de Sucesos'}
    ${MENU_B[22]} | ${'Noticias de Tecnología'}
    ${MENU_B[23]} | ${'Noticias de Televisión'}
  `(
    'should return "$expected" when have "$name" name',
    ({ name, expected }) => {
      expect(categoryName(name, true)).toBe(expected)
    }
  )

  test.each`
    name         | expected
    ${MENU_C[0]} | ${'Contacto'}
    ${MENU_C[1]} | ${'Publicidad'}
    ${MENU_C[2]} | ${'Aviso de Privacidad'}
    ${MENU_C[3]} | ${'Términos y Condiciones'}
    ${MENU_C[4]} | ${'Aviso de Cookies'}
  `(
    'should return "$expected" when have "$name" name',
    ({ name, expected }) => {
      expect(categoryName(name, false)).toBe(expected)
    }
  )
})
