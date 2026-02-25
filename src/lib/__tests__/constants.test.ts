import * as constants from '../constants'

describe('Constants', () => {
  it('should have all expected exports', () => {
    Object.values(constants).forEach(value => {
      expect(value).toBeDefined()
    })
  })

  it('should have Sucesos in the main menu', () => {
    const sucesos = constants.MAIN_MENU.find(item => item.name === 'Sucesos')
    expect(sucesos).toBeDefined()
    expect(sucesos?.href).toBe('/categoria/sucesos')
  })
})
