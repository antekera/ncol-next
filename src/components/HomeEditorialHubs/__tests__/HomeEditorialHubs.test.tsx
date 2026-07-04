import { render, screen } from '@testing-library/react'
import { HomeEditorialHubs } from '..'

describe('HomeEditorialHubs', () => {
  test('renders the national editorial hubs', () => {
    render(<HomeEditorialHubs />)

    expect(screen.getByText('Noticiascol en Venezuela')).toBeInTheDocument()
    expect(
      screen.getByText('Cobertura nacional con profundidad regional')
    ).toBeInTheDocument()
    expect(screen.getByText('Venezuela')).toBeInTheDocument()
    expect(screen.getByText('Zulia y regiones')).toBeInTheDocument()
  })
})
