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
it('refreshes headline validity at Caracas midnight until the updated editorial response arrives', async () => {
  const { rerender } = render(
    <DailyBoundary day='2026-10-18'>
      <p>Portada anterior</p>
    </DailyBoundary>
  )
  expect(screen.getByText('Portada anterior')).toBeVisible()
  act(() => jest.advanceTimersByTime(1000))
  expect(screen.queryByText('Portada anterior')).toBeNull()
  expect(refresh).toHaveBeenCalledTimes(1)
  await act(() => window.dispatchEvent(new Event('focus')))
  expect(refresh).toHaveBeenCalledTimes(1)
  rerender(
    <DailyBoundary day='2026-10-19'>
      <p>Portada actualizada</p>
    </DailyBoundary>
  )
  expect(screen.getByText('Portada actualizada')).toBeVisible()
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

it('refreshes once when manual priority expires and accepts the replacement on the same day', async () => {
  jest.setSystemTime(new Date('2026-10-18T15:00:00Z'))
  const { rerender } = render(
    <DailyBoundary day='2026-10-18' expiresAt={Date.now() + 1000}>
      <p>Destacada manual</p>
    </DailyBoundary>
  )
  act(() => jest.advanceTimersByTime(999))
  expect(screen.getByText('Destacada manual')).toBeVisible()
  act(() => jest.advanceTimersByTime(1))
  expect(screen.queryByText('Destacada manual')).toBeNull()
  expect(refresh).toHaveBeenCalledTimes(1)
  await act(() => window.dispatchEvent(new Event('focus')))
  expect(refresh).toHaveBeenCalledTimes(1)
  rerender(
    <DailyBoundary day='2026-10-18'>
      <p>Portada normal</p>
    </DailyBoundary>
  )
  expect(screen.getByText('Portada normal')).toBeVisible()
})

it('checks manual expiry after a tab resumes before midnight', async () => {
  jest.setSystemTime(new Date('2026-10-18T15:00:00Z'))
  render(
    <DailyBoundary day='2026-10-18' expiresAt={Date.now() + 1000}>
      <p>Destacada vencida</p>
    </DailyBoundary>
  )
  jest.setSystemTime(new Date('2026-10-18T16:00:00Z'))
  await act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(screen.queryByText('Destacada vencida')).toBeNull()
  expect(refresh).toHaveBeenCalledTimes(1)
})
