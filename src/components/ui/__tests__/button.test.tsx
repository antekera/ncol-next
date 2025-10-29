import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('ui/Button', () => {
  test('renders with default variant and size', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button', { name: 'Click' })
    expect(btn).toHaveClass('inline-flex')
  })

  test('applies outline variant and sm size', () => {
    render(
      <Button variant='outline' size='sm'>
        Outline
      </Button>
    )
    const btn = screen.getByRole('button', { name: 'Outline' })
    expect(btn.className).toMatch(/border/) // from outline variant
  })
})
