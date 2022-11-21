import React from 'react'

import { render } from '@testing-library/react'

import { PostHero } from '..'
import { pageProps } from '../../../__mocks__/page-props.json'

describe('PostHero', () => {
  test('should match snapshots', () => {
    const { container } = render(
      <PostHero
        categories={pageProps.post.categories}
        title={pageProps.post.title}
        slug={pageProps.post.slug}
        uri={pageProps.post.uri}
        date={pageProps.post.date}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
