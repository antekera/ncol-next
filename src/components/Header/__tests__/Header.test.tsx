import { render } from '@testing-library/react'
import { Header } from '..'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  }
}))

// TODO: Skipping tests temporarily
describe.skip('Header', () => {
  test('should match snapshots main', () => {
    const { container } = render(<Header headerType='main' />)
    expect(container).toMatchSnapshot()
  })

  test('should match snapshots category', () => {
    const { container } = render(<Header headerType='category' />)
    expect(container).toMatchSnapshot()
  })

  test('should match snapshots single', () => {
    const { container } = render(<Header headerType='single' />)
    expect(container).toMatchSnapshot()
  })

  test('should match snapshots share', () => {
    const { container } = render(<Header headerType='share' />)
    expect(container).toMatchSnapshot()
  })

  test('should match snapshots primary', () => {
    const { container } = render(<Header headerType='primary' />)
    expect(container).toMatchSnapshot()
  })

  test('renders the correct header type', () => {
    const PAGE_DESCRIPTION = 'lorem ipsum'
    const { getByText } = render(
      <Header headerType='main' title={PAGE_DESCRIPTION} />
    )
    expect(getByText(PAGE_DESCRIPTION)).toBeInTheDocument()
  })
})
