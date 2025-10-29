import { render, screen } from '@testing-library/react'
import { Header } from '..'

jest.mock('@components/SideNav', () => ({
  SideNav: () => <nav data-testid='sidenav' />
}))
jest.mock('@components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))
jest.mock('@components/Logo', () => ({ Logo: () => <div aria-label='logo' /> }))
jest.mock('@components/DateTime', () => ({ DateTime: () => <time>date</time> }))
jest.mock('@components/SearchToggle', () => ({
  SearchToggle: () => <button>search</button>
}))
jest.mock('@components/ThemeSwitch', () => ({
  ModeToggle: () => <button>theme</button>
}))
jest.mock('@components/Header/menu/Main', () => ({
  MainMenu: () => <div data-testid='main-menu' />
}))
jest.mock('@components/ProgressBar', () => ({
  ProgressBar: () => <div data-testid='progress' />
}))
jest.mock('@components/Header/HeaderShare', () => ({
  HeaderShare: () => <div data-testid='share' />
}))
jest.mock('../utils', () => ({
  logoMobileOptions: () => ({ type: 'logoname', width: 100, height: 20 }),
  logoDesktopOptions: () => ({ type: 'logoname', width: 100, height: 20 })
}))

describe('Header', () => {
  test('renders main header with MainMenu and DateTime', () => {
    render(<Header headerType='main' title='title' />)
    expect(screen.getByTestId('main-menu')).toBeInTheDocument()
    expect(screen.getByText('date')).toBeInTheDocument()
    expect(screen.getAllByLabelText('logo').length).toBeGreaterThanOrEqual(1)
  })

  test('renders single header with progress bar and header share', () => {
    render(<Header headerType='single' title='t' uri='/p' />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
    expect(screen.getByTestId('share')).toBeInTheDocument()
  })
})
