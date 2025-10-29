import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchToggle } from '..'

jest.mock('@components/Search', () => ({
  Search: () => (
    <div>
      <input aria-label='Campo de búsqueda' />
    </div>
  )
}))

describe('SearchToggle', () => {
  const user = userEvent.setup()

  test('toggles search on button click and closes on outside click', async () => {
    jest.useRealTimers()
    render(<SearchToggle />)
    const toggle = screen.getByRole('button', { name: /toggle search/i })
    await user.click(toggle)
    expect(screen.getByLabelText('Campo de búsqueda')).toBeInTheDocument()

    // outside click (document)
    await user.click(document.body as any)
    await waitFor(() =>
      expect(
        screen.queryByLabelText('Campo de búsqueda')
      ).not.toBeInTheDocument()
    )
  })
})
