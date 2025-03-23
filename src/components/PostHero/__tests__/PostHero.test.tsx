import { render } from '@testing-library/react'
import { PostHero } from '..'
import { pageProps } from '../../../__mocks__/page-props.json'

// TODO: Skipping tests temporarily
describe.skip('PostHero', () => {
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
