import { render } from '@testing-library/react'
import { Logo, LogoType } from '..'

describe('Logo', () => {
  test('should use logocom as default type', () => {
    const { asFragment } = render(<Logo />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('should use logocomb as type', () => {
    const { asFragment } = render(<Logo type={LogoType.logocomb} />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('should use logoname as default type', () => {
    const { asFragment } = render(<Logo type={LogoType.logoname} />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('should use logonameb as default type', () => {
    const { asFragment } = render(<Logo type={LogoType.logonameb} />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('should use logosquare as default type', () => {
    const { asFragment } = render(<Logo type={LogoType.logosquare} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
