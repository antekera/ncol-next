import { isReadingTextVisible } from '../occlusion'

describe('visible body text rather than the entire long article', () => {
  afterEach(() => {
    document.body.replaceChildren()
    jest.restoreAllMocks()
  })
  it('accepts a genuine visible portion of a long paragraph and subtracts the share header', () => {
    const paragraph = document.createElement('p')
    document.body.append(paragraph)
    jest
      .spyOn(paragraph, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, -1000, 300, 3000))
    expect(isReadingTextVisible(paragraph, [])).toBe(true)
    expect(
      isReadingTextVisible(paragraph, [
        new DOMRect(0, 0, 300, window.innerHeight)
      ])
    ).toBe(false)
  })
  it('requires half of a short paragraph or 80 px of a long text block', () => {
    const paragraph = document.createElement('p')
    document.body.append(paragraph)
    const bounds = jest
      .spyOn(paragraph, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, -21, 300, 40))
    expect(isReadingTextVisible(paragraph, [])).toBe(false)
    bounds.mockReturnValue(new DOMRect(0, -20, 300, 40))
    expect(isReadingTextVisible(paragraph, [])).toBe(true)
    bounds.mockReturnValue(new DOMRect(0, window.innerHeight - 79, 300, 3000))
    expect(isReadingTextVisible(paragraph, [])).toBe(false)
  })
})
