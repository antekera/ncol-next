import { render } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('ui/Skeleton', () => {
  test('applies base and custom classes', () => {
    const { container } = render(<Skeleton className='h-4 w-4' />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveClass('animate-pulse')
    expect(el).toHaveClass('h-4')
    expect(el).toHaveClass('w-4')
  })
})
