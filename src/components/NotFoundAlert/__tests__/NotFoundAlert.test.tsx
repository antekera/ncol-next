import { render, screen } from '@testing-library/react'
import { NotFoundAlert } from '..'
import { CMS_URL } from '@lib/constants'

describe('NotFoundAlert', () => {
  test('shows message and home link', () => {
    render(<NotFoundAlert />)
    expect(
      screen.getByRole('heading', { name: /página no encontrada/i })
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ir al inicio/i })
    expect(link).toHaveAttribute('href', CMS_URL)
  })
})
