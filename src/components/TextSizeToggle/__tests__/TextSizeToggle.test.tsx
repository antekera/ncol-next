import { fireEvent, render, screen } from '@testing-library/react'
import { GA_EVENTS } from '@lib/constants'
import {
  TextSizeToggle,
  applyTextSizePreference
} from '@components/TextSizeToggle'
import { TEXT_SIZE_STORAGE_KEY } from '@lib/textSize'

jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))

import { GAEvent } from '@lib/utils'

describe('TextSizeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-font-size')
  })

  test('loads saved size from localStorage', async () => {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, 'lg')

    render(<TextSizeToggle />)

    const increaseButton = await screen.findByRole('button', {
      name: /aumentar tamaño de letra/i
    })
    expect(increaseButton).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.fontSize).toBe('lg')
  })

  test('updates and persists selected size', async () => {
    render(<TextSizeToggle />)

    const reduceButton = await screen.findByRole('button', {
      name: /reducir tamaño de letra/i
    })
    fireEvent.click(reduceButton)

    expect(localStorage.getItem(TEXT_SIZE_STORAGE_KEY)).toBe('sm')
    expect(document.documentElement.dataset.fontSize).toBe('sm')
    expect(reduceButton).toHaveAttribute('aria-pressed', 'true')
    expect(GAEvent).toHaveBeenCalledWith({
      category: GA_EVENTS.CHANGE_TEXT_SIZE.CATEGORY,
      label: GA_EVENTS.CHANGE_TEXT_SIZE.SMALL
    })
  })

  test('applyTextSizePreference updates html dataset', () => {
    applyTextSizePreference('md')
    expect(document.documentElement.dataset.fontSize).toBe('md')
  })
})
