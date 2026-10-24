import {
  registerHomeMedia,
  reportVideoPlay,
  isHomeMediaMeasured
} from '../mediaBridge'

it('routes signals only to the active Home owner and leaves a newer owner intact on stale cleanup', () => {
  const root = document.createElement('section')
  const card = document.createElement('article')
  root.append(card)
  const play = jest.fn()
  const navigation = jest.fn()
  reportVideoPlay(card, 'youtube', 'M7lc1UVf-VE')
  expect(play).not.toHaveBeenCalled()
  const oldStop = registerHomeMedia(root, { play, navigation })
  expect(isHomeMediaMeasured(card)).toBe(true)
  const newStop = registerHomeMedia(root, { play, navigation })
  oldStop()
  reportVideoPlay(card, 'youtube', 'M7lc1UVf-VE')
  expect(play).toHaveBeenCalledTimes(1)
  newStop()
  expect(isHomeMediaMeasured(card)).toBe(false)
  reportVideoPlay(card, 'youtube', 'M7lc1UVf-VE')
  expect(play).toHaveBeenCalledTimes(1)
})
