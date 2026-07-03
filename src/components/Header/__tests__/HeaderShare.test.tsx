import { render, screen } from '@testing-library/react'
import { HeaderShare } from '../HeaderShare'

jest.mock('@components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))
jest.mock('@components/Logo', () => ({ Logo: () => <div aria-label='logo' /> }))
jest.mock('@components/ProgressBar', () => ({
  ProgressBar: () => <div data-testid='progress' />
}))
jest.mock('@components/Share', () => ({
  Share: ({ uri }: { uri: string }) => <div data-testid='share'>{uri}</div>
}))
jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ headerShareUri: '' })
}))
jest.mock('../utils', () => ({
  logoMobileOptions: () => ({ type: 'logoname', width: 100, height: 20 }),
  logoDesktopOptions: () => ({ type: 'logoname', width: 100, height: 20 })
}))

describe('HeaderShare', () => {
  test('shows share header when visible', () => {
    const { container } = render(<HeaderShare uri='/nota' visible />)

    expect(container.querySelector('header')).toHaveClass('translate-y-0')
    expect(screen.getByTestId('share')).toHaveTextContent('/nota')
  })

  test('hides share header when not visible', () => {
    const { container } = render(<HeaderShare uri='/nota' visible={false} />)

    expect(container.querySelector('header')).toHaveClass('-translate-y-16')
  })
})
