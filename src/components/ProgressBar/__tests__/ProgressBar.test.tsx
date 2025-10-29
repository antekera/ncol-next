import { render, screen } from '@testing-library/react'
import { ProgressBar } from '..'

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ contentHeight: 1000 })
}))
jest.mock('@lib/hooks/useScrollProgress', () => ({
  useScrollProgress: () => 42
}))

describe('ProgressBar', () => {
  test('renders bar with width based on scroll progress', () => {
    render(<ProgressBar />)
    const bar = screen.getByTestId('progress-bar') as HTMLDivElement
    expect(bar.style.width).toBe('42%')
  })
})
