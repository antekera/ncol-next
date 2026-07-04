import { render, screen } from '@testing-library/react'
import { HomeEditorialHubs } from '..'

describe('HomeEditorialHubs', () => {
  test('renders the national editorial hubs', () => {
    render(<HomeEditorialHubs />)

    expect(screen.getByText('Noticiascol en Venezuela')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Noticias de Venezuela con contexto y despliegue territorial'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Venezuela')).toBeInTheDocument()
    expect(screen.getByText('Regiones clave')).toBeInTheDocument()
  })
})
