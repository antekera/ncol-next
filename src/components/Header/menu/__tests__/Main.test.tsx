import { render, screen } from '@testing-library/react'
import { MainMenu } from '../Main'

jest.mock('@components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))

describe('MainMenu', () => {
  test('renders only the three home quick links', () => {
    render(<MainMenu />)

    expect(screen.getByText('Más vistos')).toBeInTheDocument()
    expect(screen.getByText('Más leídos')).toBeInTheDocument()
    expect(screen.getByText('Por fecha')).toBeInTheDocument()
    expect(screen.queryByText('Sucesos')).not.toBeInTheDocument()
  })
})
