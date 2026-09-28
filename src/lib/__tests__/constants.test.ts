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

  it('uses a yellow color for Clasificados in the services menu', () => {
    const clasificados = constants.SERVICES_MENU.find(
      item => item.name === 'Clasificados'
    )
    expect(clasificados?.color).toContain('from-yellow-500')
    expect(clasificados?.color).toContain('via-amber-600')
    expect(clasificados?.color).toContain('to-yellow-800')
  })
})
