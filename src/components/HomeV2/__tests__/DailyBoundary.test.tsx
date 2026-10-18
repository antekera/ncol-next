import { act, render, screen } from '@testing-library/react'
import { DailyBoundary } from '../DailyBoundary'
const refresh = jest.fn()
const router = { refresh }
jest.mock('next/navigation', () => ({ useRouter: () => router }))
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-19T03:59:59Z'))
  refresh.mockClear()
})
afterEach(() => jest.useRealTimers())
it('hides expired server and client modules at Caracas midnight until a fresh daily response arrives', async () => {
  const { rerender } = render(
    <DailyBoundary day='2026-10-18'>
      <p>Noticias de ayer</p>
    </DailyBoundary>
  )
  expect(screen.getByText('Noticias de ayer')).toBeVisible()
  act(() => jest.advanceTimersByTime(1000))
  expect(screen.queryByText('Noticias de ayer')).toBeNull()
  expect(refresh).toHaveBeenCalledTimes(1)
  await act(() => window.dispatchEvent(new Event('focus')))
  expect(refresh).toHaveBeenCalledTimes(1)
  rerender(
    <DailyBoundary day='2026-10-19'>
      <p>Noticias de hoy</p>
    </DailyBoundary>
  )
  expect(screen.getByText('Noticias de hoy')).toBeVisible()
})
it('checks the date when returning from a suspended mobile tab', async () => {
  render(
    <DailyBoundary day='2026-10-18'>
      <p>Noticias vencidas</p>
    </DailyBoundary>
  )
  jest.setSystemTime(new Date('2026-10-19T09:00:00Z'))
  await act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(screen.queryByText('Noticias vencidas')).toBeNull()
  expect(refresh).toHaveBeenCalledTimes(1)
})
