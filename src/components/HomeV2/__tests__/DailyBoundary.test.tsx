import { useEffect } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  DailyBoundary,
  EditorialRoot,
  EditorialSlot,
  useEditorialDay
} from '../DailyBoundary'
const originalFetch = global.fetch
const request = jest.fn()
beforeEach(() => {
  request.mockClear()
  global.fetch = request
  jest.useFakeTimers().setSystemTime(new Date('2026-10-23T15:00:00Z'))
})
afterEach(() => {
  global.fetch = originalFetch
  jest.useRealTimers()
})

it('switches server-rendered nodes at manual expiry without HTTP or remounting ads', () => {
  const now = Date.now(),
    mount = jest.fn(),
    unmount = jest.fn()
  function Ad() {
    useEffect(() => {
      mount()
      return () => {
        unmount()
      }
    }, [])
    return <aside>Publicidad</aside>
  }
  render(
    <DailyBoundary initialNow={now} deadlines={[now + 1000]}>
      <Ad />
      <EditorialSlot
        versions={[
          { at: now, content: <p>Destacada manual</p> },
          { at: now + 1000, content: <p>Portada ordinaria</p> }
        ]}
      />
    </DailyBoundary>
  )
  act(() => jest.advanceTimersByTime(1000))
  expect(screen.queryByText('Destacada manual')).toBeNull()
  expect(screen.getByText('Portada ordinaria')).toBeVisible()
  expect(mount).toHaveBeenCalledTimes(1)
  expect(unmount).not.toHaveBeenCalled()
  expect(request).not.toHaveBeenCalled()
})
it('updates the editorial day and nodes at Caracas midnight', () => {
  const now = Date.parse('2026-10-24T03:59:59Z')
  jest.setSystemTime(now)
  const { container } = render(
    <DailyBoundary initialNow={now} deadlines={[now + 1000]}>
      <EditorialRoot className='home'>
        <EditorialSlot
          versions={[
            { at: now, content: <p>Noticia del 23</p> },
            { at: now + 1000, content: <p>Noticia sin fecha</p> }
          ]}
        />
      </EditorialRoot>
    </DailyBoundary>
  )
  act(() => jest.advanceTimersByTime(1000))
  expect(container.firstChild).toHaveAttribute(
    'data-editorial-day',
    '2026-10-24'
  )
  expect(screen.queryByText('Noticia del 23')).toBeNull()
  expect(screen.getByText('Noticia sin fecha')).toBeVisible()
  expect(request).not.toHaveBeenCalled()
})
it('selects the valid edition when hydrating an already expired snapshot', () => {
  const now = Date.now()
  render(
    <DailyBoundary initialNow={now - 2000} deadlines={[now - 1000]}>
      <EditorialSlot
        versions={[
          { at: now - 2000, content: <p>Vencida</p> },
          { at: now - 1000, content: <p>Válida</p> }
        ]}
      />
    </DailyBoundary>
  )
  expect(screen.queryByText('Vencida')).toBeNull()
  expect(screen.getByText('Válida')).toBeVisible()
  expect(request).not.toHaveBeenCalled()
})
it('catches up across multiple deadlines after a suspended tab without polling', async () => {
  const now = Date.now()
  render(
    <DailyBoundary initialNow={now} deadlines={[now + 1000, now + 2000]}>
      <EditorialSlot
        versions={[
          { at: now, content: <p>Primera</p> },
          { at: now + 1000, content: <p>Segunda</p> },
          { at: now + 2000, content: <p>Tercera</p> }
        ]}
      />
    </DailyBoundary>
  )
  jest.setSystemTime(now + 3000)
  await act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(screen.getByText('Tercera')).toBeVisible()
  await act(() => window.dispatchEvent(new Event('focus')))
  expect(screen.getAllByText('Tercera')).toHaveLength(1)
  expect(request).not.toHaveBeenCalled()
})

it('does not rerender day-only feeds when manual priority expires on the same day', () => {
  const renders = jest.fn(),
    now = Date.now()
  function Feed() {
    const day = useEditorialDay()
    renders()
    return <p>{day}</p>
  }
  render(
    <DailyBoundary initialNow={now} deadlines={[now + 1000]}>
      <Feed />
    </DailyBoundary>
  )
  act(() => jest.advanceTimersByTime(1000))
  expect(renders).toHaveBeenCalledTimes(1)
})
