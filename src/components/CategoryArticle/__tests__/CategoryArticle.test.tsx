import React from 'react'

import { render } from '@testing-library/react'

import { CategoryArticle } from '..'
import { pageProps } from '../../../__mocks__/page-props.json'

const props = {
  id: '1234',
  ...pageProps.posts.edges[0].node,
  className: 'class',
  isFirst: false,
  isLast: false
}

describe('CategoryArticle', () => {
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
