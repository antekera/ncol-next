import { render, screen } from '@testing-library/react'
import { MainMenu } from '../Main'

jest.mock('@components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))

describe('MainMenu', () => {
  test('renders the editorial desktop categories', () => {
    render(<MainMenu />)

    expect(screen.getByText('Sucesos')).toBeInTheDocument()
    expect(screen.getByText('Nacionales')).toBeInTheDocument()
    expect(screen.getByText('Zulia')).toBeInTheDocument()
    expect(screen.queryByText('Por fecha')).not.toBeInTheDocument()
  })
})
