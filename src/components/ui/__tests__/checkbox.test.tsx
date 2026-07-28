import { fireEvent, render, screen } from '@testing-library/react'
import { Checkbox } from '@components/ui/checkbox'

describe('Checkbox', () => {
  test('renders unchecked by default', () => {
    render(<Checkbox aria-label='Aceptar términos' />)
    const checkbox = screen.getByRole('checkbox', { name: /aceptar términos/i })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  test('calls onCheckedChange with true when clicked', () => {
    const onCheckedChange = jest.fn()
    render(
      <Checkbox aria-label='Aceptar términos' onCheckedChange={onCheckedChange} />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('reflects the checked state via data-state', () => {
    render(
      <Checkbox
        aria-label='Aceptar términos'
        checked
        onCheckedChange={() => {}}
      />
    )
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  test('is disabled when the disabled prop is set', () => {
    render(<Checkbox aria-label='Aceptar términos' disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
