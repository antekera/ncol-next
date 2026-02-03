import * as constants from '../constants'

describe('Constants', () => {
  it('should have all expected exports', () => {
    Object.values(constants).forEach(value => {
      expect(value).toBeDefined()
    })
  })

  it('should have Horóscopo in the main menu', () => {
    const horoscopo = constants.MAIN_MENU.find(
      item => item.name === 'Horóscopo'
    )
    expect(horoscopo).toBeDefined()
    expect(horoscopo?.href).toBe('/horoscopo')
  })
})
