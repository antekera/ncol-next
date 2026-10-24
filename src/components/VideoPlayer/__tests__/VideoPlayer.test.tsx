import { createRef } from 'react'
import { useInView } from 'react-intersection-observer'
jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(() => ({ ref: jest.fn(), inView: true }))
}))
import { render, fireEvent, waitFor } from '@testing-library/react'
import { VideoPlayer } from '..'
import { registerHomeMedia } from '@lib/homeV2/mediaBridge'
import { observeYoutubePlayback } from '@lib/homeV2/youtubePlayback'
import { observeVisible } from '@lib/homeV2/visibility'

jest.mock('@lib/homeV2/youtubePlayback', () => ({
  observeYoutubePlayback: jest.fn()
}))
jest.mock('@lib/homeV2/visibility', () => ({
  observeVisible: jest.fn(() => jest.fn())
}))

const url = 'https://www.youtube.com/watch?v=M7lc1UVf-VE'

beforeEach(() => jest.clearAllMocks())

it('preserves the default native iframe, source, ref and permissions', () => {
  const iframeRef = createRef<HTMLIFrameElement>()
  const { container } = render(<VideoPlayer url={url} iframeRef={iframeRef} />)
  const frame = container.querySelector('iframe')!
  expect(frame.src).toBe('https://www.youtube.com/embed/M7lc1UVf-VE')
  expect(iframeRef.current).toBe(frame)
  expect(frame.getAttribute('allow')).toContain('accelerometer')
  expect(frame.title).toBe('Video destacado')
  expect(observeYoutubePlayback).not.toHaveBeenCalled()
})

it('prepares a Home QA iframe without autoplay and waits for interaction plus an active owner', async () => {
  const iframeRef = createRef<HTMLIFrameElement>()
  let confirm: () => void = () => {}
  const stop = jest.fn()
  jest.mocked(observeYoutubePlayback).mockImplementation((_frame, play) => {
    confirm = play
    return stop
  })
  const props = { url, iframeRef, homeMeasurement: true }
  const { container, unmount } = render(<VideoPlayer {...props} />)
  const frame = container.querySelector('iframe')!
  expect(new URL(frame.src).searchParams.get('enablejsapi')).toBe('1')
  expect(new URL(frame.src).searchParams.has('autoplay')).toBe(false)
  expect(observeYoutubePlayback).not.toHaveBeenCalled()
  frame.focus()
  fireEvent.blur(window)
  await Promise.resolve()
  expect(observeYoutubePlayback).not.toHaveBeenCalled()
  const play = jest.fn()
  const stopOwner = registerHomeMedia(container, {
    play,
    navigation: jest.fn()
  })
  fireEvent.blur(window)
  await waitFor(() => expect(observeYoutubePlayback).toHaveBeenCalledTimes(1))
  expect(play).not.toHaveBeenCalled()
  confirm()
  expect(play).toHaveBeenCalledWith(frame, 'youtube', 'M7lc1UVf-VE')
  fireEvent.blur(window)
  expect(observeYoutubePlayback).toHaveBeenCalledTimes(1)
  unmount()
  expect(stop).toHaveBeenCalledTimes(1)
  expect(iframeRef.current).toBeNull()
  stopOwner()
})

it('can bind a genuinely visible iframe without relying on cross-frame focus events', async () => {
  const stopPlayer = jest.fn()
  jest.mocked(observeYoutubePlayback).mockReturnValue(stopPlayer)
  const { container, unmount } = render(
    <VideoPlayer {...{ url, homeMeasurement: true }} />
  )
  const frame = container.querySelector('iframe')!
  await waitFor(() =>
    expect(observeVisible).toHaveBeenCalledWith(frame, expect.any(Function))
  )
  const stopOwner = registerHomeMedia(container, {
    play: jest.fn(),
    navigation: jest.fn()
  })
  jest.mocked(observeVisible).mock.calls[0][1]()
  await waitFor(() =>
    expect(observeYoutubePlayback).toHaveBeenCalledWith(
      frame,
      expect.any(Function)
    )
  )
  unmount()
  expect(stopPlayer).toHaveBeenCalledTimes(1)
  stopOwner()
})

it('reserves the player area but defers offscreen carousel iframes until they approach the viewport', () => {
  jest.mocked(useInView).mockReturnValue(visibility(false))
  const { container, rerender } = render(
    <VideoPlayer url={url} deferUntilVisible />
  )
  expect(container.querySelector('iframe')).toBeNull()
  expect(container.firstChild).toHaveStyle({ aspectRatio: '16/9' })
  jest.mocked(useInView).mockReturnValue(visibility(true))
  rerender(<VideoPlayer url={url} deferUntilVisible />)
  expect(container.querySelectorAll('iframe')).toHaveLength(1)
})

function visibility(inView: boolean) {
  const ref = jest.fn()
  const tuple: [typeof ref, boolean, undefined] = [ref, inView, undefined]
  return Object.assign(tuple, { ref, inView, entry: undefined })
}
