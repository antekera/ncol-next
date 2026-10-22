import { useLayoutEffect } from 'react'
import { act, fireEvent, renderHook } from '@testing-library/react'
import { useScrollProgress } from '../useScrollProgress'

describe('useScrollProgress', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000
    })
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true
    })
  })

  it('coalesces scroll events and updates from the latest position on the next frame', () => {
    const { result } = renderHook(() => useScrollProgress(2000))
    act(() => {
      window.scrollY = 250
      fireEvent.scroll(window)
      window.scrollY = 500
      fireEvent.scroll(window)
    })
    expect(result.current).toBe(0)
    act(() => {
      jest.advanceTimersByTime(20)
    })
    expect(result.current).toBe(50)
    act(() => {
      window.scrollY = 1500
      fireEvent.scroll(window)
      jest.advanceTimersByTime(20)
    })
    expect(result.current).toBe(100)
  })

  it('cancels a pending frame on unmount', () => {
    const cancel = jest.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = renderHook(() => useScrollProgress(2000))
    fireEvent.scroll(window)
    unmount()
    expect(cancel).toHaveBeenCalled()
    cancel.mockRestore()
  })

  it('uses new article geometry after rerender instead of a pending old frame', () => {
    const { result, rerender } = renderHook(
      ({ start }) => useScrollProgress(2000, start),
      { initialProps: { start: 0 } }
    )
    window.scrollY = 500
    fireEvent.scroll(window)
    rerender({ start: 500 })
    act(() => {
      jest.advanceTimersByTime(20)
    })
    expect(result.current).toBe(0)
  })
  it('breaks synchronous scroll feedback during React layout commits', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => {
      const progress = useScrollProgress(2000)
      useLayoutEffect(() => {
        if (progress > 0 && progress < 60) {
          window.scrollY = (progress + 1) * 10
          window.dispatchEvent(new Event('scroll'))
        }
      }, [progress])
      return progress
    })
    expect(() =>
      act(() => {
        window.scrollY = 10
        fireEvent.scroll(window)
      })
    ).not.toThrow()
    act(() => {
      jest.advanceTimersByTime(20)
    })
    expect(result.current).toBe(1)
    errors.mockRestore()
  })
})
