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
    // 450 words should be around 2 minutes (450 / 225 = 2)
    const content = Array(450).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(2)
  })

  it('should strip HTML tags correctly', () => {
    const content = '<div><p>Word</p><span>Another word</span></div>'
    // 3 words: Word, Another, word (wait, "Another word" is 2 words)
    // Actually plainText would be " Word  Another word "
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('should round to the nearest integer', () => {
    // 340 words / 225 = 1.51 -> 2
    const content1 = Array(340).fill('word').join(' ')
    expect(calculateReadingTime(content1)).toBe(2)

    // 225 words / 225 = 1
    const content2 = Array(225).fill('word').join(' ')
    expect(calculateReadingTime(content2)).toBe(1)

    // 100 words / 225 = 0.44 -> 0, but we return 1 minimum if it's > 0
    const content3 = Array(100).fill('word').join(' ')
    expect(calculateReadingTime(content3)).toBe(1)
  })
})
