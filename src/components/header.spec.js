import { render } from '@testing-library/react'
import Header from '../components/header'

describe('Header component', () => {
  test('should match snapshot', () => {
    const { container } = render(<Header />)
    expect(container).toMatchSnapshot()
  })
})
