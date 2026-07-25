import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeToggle } from '..'
import { GA_EVENTS } from '@lib/constants'

const setThemeMock = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: setThemeMock,
    theme: 'system'
  })
}))

jest.mock('@lib/utils/ga', () => ({ GAEvent: jest.fn() }))
import { GAEvent } from '@lib/utils/ga'

describe('ModeToggle', () => {
  beforeEach(() => {
    setThemeMock.mockClear()
    ;(GAEvent as jest.Mock).mockClear()
  })

  test('toggles from system dark to light and fires analytics', async () => {
    const user = userEvent.setup()

    jest.useRealTimers()
    render(<ModeToggle isHeaderPrimary={false} />)

    const button = await screen.findByRole('button', {
      name: /toggle theme/i
    })
    await user.click(button)
    expect(setThemeMock).toHaveBeenCalledWith('light')
    expect(GAEvent).toHaveBeenCalledWith({
      category: GA_EVENTS.CHANGE_THEME.CATEGORY,
      label: GA_EVENTS.CHANGE_THEME.TO_LIGHT
    })
  }, 15000)
})
