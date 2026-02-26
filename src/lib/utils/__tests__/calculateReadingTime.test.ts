import { calculateReadingTime } from '../calculateReadingTime'

describe('calculateReadingTime', () => {
  it('should return 0 for empty content', () => {
    expect(calculateReadingTime('')).toBe(0)
    expect(calculateReadingTime()).toBe(0)
  })

  it('should return 1 for short content', () => {
    const content = '<p>Hello world</p>'
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('should calculate reading time correctly for longer content', () => {
    // 390 words should be 3 minutes (390 / 130 = 3)
    const content = Array(390).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(3)
  })

  it('should strip HTML tags correctly', () => {
    const content = '<div><p>Word</p><span>Another word</span></div>'
    // 3 words: Word, Another, word
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('should round to the nearest integer', () => {
    // 200 words / 130 = 1.53 -> 2
    const content1 = Array(200).fill('word').join(' ')
    expect(calculateReadingTime(content1)).toBe(2)

    // 130 words / 130 = 1
    const content2 = Array(130).fill('word').join(' ')
    expect(calculateReadingTime(content2)).toBe(1)

    // 50 words / 130 = 0.38 -> 0, but we return 1 minimum if it's > 0
    const content3 = Array(50).fill('word').join(' ')
    expect(calculateReadingTime(content3)).toBe(1)
  })
})
