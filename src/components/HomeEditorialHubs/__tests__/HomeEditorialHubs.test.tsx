import { render, screen } from '@testing-library/react'
import { HomeEditorialHubs } from '..'

describe('HomeEditorialHubs', () => {
  test('renders the national editorial hubs', () => {
    render(<HomeEditorialHubs />)

    expect(screen.getByText('Explora Noticiascol')).toBeInTheDocument()
    expect(screen.getByText('Venezuela')).toBeInTheDocument()
    expect(screen.getByText('Zulia')).toBeInTheDocument()
  })
})
