import { render } from '@testing-library/react'
import { CategoryArticle } from '..'
import { pageProps } from '@mocks/page-props.json'

const props = {
  id: '1234',
  ...pageProps.posts.edges[0].node,
  className: 'class',
  isFirst: false,
  isLast: false,
  contentType: {
    cursor: '123',
    node: {
      id: '123'
    }
  },
  pageInfo: {
    endCursor: '123',
    hasNextPage: true,
    hasPreviousPage: true,
    startCursor: '123'
  }
}

// TODO: Skipping tests temporarily
describe.skip('CategoryArticle', () => {
  test('should match snapshot to type list', () => {
    const { container } = render(<CategoryArticle {...props} type='list' />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshot to type thumbnail', () => {
    const { container } = render(
      <CategoryArticle {...props} type='thumbnail' />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshot to type secondary', () => {
    const { container } = render(
      <CategoryArticle {...props} type='secondary' />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshot to type sidebar', () => {
    const { container } = render(
      <CategoryArticle {...props} excerpt={undefined} type='sidebar' />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshot to type recent_news', () => {
    const { container } = render(
      <CategoryArticle {...props} type='recent_news' />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
