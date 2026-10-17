import { isUncovered, uncoveredFraction } from '../occlusion'

const box = (left: number, top: number, width: number, height: number) =>
  new DOMRect(left, top, width, height)

describe('editorial area after own overlays', () => {
  it('subtracts the union of clipped overlays, preserving the 50% boundary', () => {
    const target = box(0, 0, 100, 100)
    expect(
      uncoveredFraction(target, target, [
        box(0, 0, 100, 40),
        box(0, 0, 100, 40)
      ])
    ).toBe(0.6)
    expect(uncoveredFraction(target, target, [box(-100, -100, 200, 150)])).toBe(
      0.5
    )
    expect(
      uncoveredFraction(target, target, [
        box(0, 0, 100, 30),
        box(0, 70, 100, 30)
      ])
    ).toBe(0.4)
  })

  it('uses the full card as denominator after viewport clipping', () => {
    const target = box(0, -50, 100, 100)
    expect(uncoveredFraction(target, box(0, 0, 100, 100), [])).toBe(0.5)
    expect(
      uncoveredFraction(target, box(0, 0, 100, 100), [box(0, 0, 100, 1)])
    ).toBe(0.49)
    expect(uncoveredFraction(box(0, 0, 0, 100), target, [])).toBe(0)
  })

  it('clips a carousel card to the scroll container instead of only the viewport', () => {
    const scroller = document.createElement('div')
    scroller.style.overflowX = 'auto'
    const card = document.createElement('article')
    scroller.append(card)
    document.body.append(scroller)
    jest
      .spyOn(scroller, 'getBoundingClientRect')
      .mockReturnValue(box(0, 0, 40, 100))
    jest
      .spyOn(card, 'getBoundingClientRect')
      .mockReturnValue(box(0, 0, 100, 100))
    Object.defineProperty(scroller, 'clientWidth', {
      configurable: true,
      value: 40
    })
    expect(isUncovered(card, [])).toBe(false)
    Object.defineProperty(scroller, 'clientWidth', {
      configurable: true,
      value: 50
    })
    expect(isUncovered(card, [])).toBe(true)
    scroller.remove()
    jest.restoreAllMocks()
  })
})
