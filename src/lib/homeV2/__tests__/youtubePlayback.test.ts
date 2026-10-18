import { observeYoutubePlayback } from '../youtubePlayback'

it('requires provider PLAYING, ignores blur/buffering, and destroys the owned player on cleanup', async () => {
  let state: (event: { data: number }) => void = () => {}
  const destroy = jest.fn()
  const player = jest.fn().mockImplementation((_frame, options) => {
    state = options.events.onStateChange
    return { destroy }
  })
  Object.assign(window, { YT: { Player: player } })
  const frame = document.createElement('iframe')
  frame.src = 'https://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1'
  document.body.append(frame)
  const play = jest.fn()
  const stop = observeYoutubePlayback(frame, play)
  await Promise.resolve()
  window.dispatchEvent(new Event('blur'))
  state({ data: 3 })
  state({ data: 2 })
  expect(play).not.toHaveBeenCalled()
  state({ data: 1 })
  expect(play).toHaveBeenCalledTimes(1)
  stop()
  state({ data: 1 })
  expect(play).toHaveBeenCalledTimes(1)
  expect(destroy).toHaveBeenCalledTimes(1)
  frame.remove()
  Reflect.deleteProperty(window, 'YT')
})

it('shares the script, preserves an existing ready callback and ignores a cancelled subscriber', async () => {
  jest.resetModules()
  const { observeYoutubePlayback: observe } = await import('../youtubePlayback')
  const previous = jest.fn()
  Object.assign(window, { onYouTubeIframeAPIReady: previous })
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const stopFirst = observe(frame, jest.fn())
  const stopSecond = observe(frame, jest.fn())
  expect(
    document.querySelectorAll(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
  ).toHaveLength(1)
  stopFirst()
  const Player = jest.fn().mockImplementation(() => ({ destroy: jest.fn() }))
  Object.assign(window, { YT: { Player } })
  Reflect.get(window, 'onYouTubeIframeAPIReady')()
  await Promise.resolve()
  expect(previous).toHaveBeenCalledTimes(1)
  expect(Player).toHaveBeenCalledTimes(1)
  expect(Reflect.get(window, 'onYouTubeIframeAPIReady')).toBe(previous)
  stopSecond()
  frame.remove()
  document
    .querySelector('script[src="https://www.youtube.com/iframe_api"]')
    ?.remove()
  Reflect.deleteProperty(window, 'YT')
  Reflect.deleteProperty(window, 'onYouTubeIframeAPIReady')
})

it('keeps native playback usable after script failure and permits a later retry', async () => {
  jest.resetModules()
  const { observeYoutubePlayback: observe } = await import('../youtubePlayback')
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const play = jest.fn()
  const stop = observe(frame, play)
  document
    .querySelector('script[src="https://www.youtube.com/iframe_api"]')!
    .dispatchEvent(new Event('error'))
  await Promise.resolve()
  expect(frame.isConnected).toBe(true)
  expect(play).not.toHaveBeenCalled()
  const retryStop = observe(frame, play)
  expect(
    document.querySelectorAll(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
  ).toHaveLength(1)
  stop()
  retryStop()
  document
    .querySelector('script[src="https://www.youtube.com/iframe_api"]')!
    .dispatchEvent(new Event('error'))
  await Promise.resolve()
  frame.remove()
})
