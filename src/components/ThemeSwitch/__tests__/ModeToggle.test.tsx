import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeToggle } from '..'

jest.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: jest.fn() })
}))

jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))
import { GAEvent } from '@lib/utils/ga'

describe('ModeToggle', () => {
  const user = userEvent.setup()

  test('toggles theme and fires analytics', async () => {
    jest.useRealTimers()
    localStorage.removeItem('theme')
    render(<ModeToggle isHeaderPrimary={false} />)

    const button = await screen.findByRole('button', { name: /toggle theme/i })
    await user.click(button)
    expect(GAEvent).toHaveBeenCalled()
  })
})
