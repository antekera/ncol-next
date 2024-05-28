import { render } from '@testing-library/react'

import { PostHeader } from '..'
import { pageProps } from '../../../__mocks__/page-props.json'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  }
}))

describe('PostHeader', () => {
  test('should match snapshots', () => {
    const { container } = render(<PostHeader {...pageProps.post} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
