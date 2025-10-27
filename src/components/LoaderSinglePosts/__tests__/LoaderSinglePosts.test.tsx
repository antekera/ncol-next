/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { LoaderSinglePost } from '..'

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))
jest.mock('@lib/hooks/useDebounce', () => ({
  useDebounceInView: (v: boolean) => v
}))
jest.mock('@lib/hooks/useIsMobile', () => ({ useIsMobile: () => false }))
jest.mock('@lib/hooks/data/useCategoryPosts', () => ({
  useCategoryPosts: () => ({
    isLoading: false,
    error: undefined,
    fetchMorePosts: jest.fn().mockImplementation(async () => ({
      posts: {
        edges: [
          {
            node: {
              slug: 'a',
              title: 'Otro post',
              uri: '/a',
              excerpt: 'e',
              featuredImage: { node: { sourceUrl: '/a.jpg' } },
              categories: { edges: [], type: '' }
            }
          }
        ]
      }
    }))
  })
}))
jest.mock('@lib/utils/ga', () => ({ GAPageView: jest.fn() }))

jest.mock('@components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))
jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: any) => <img alt={title ?? ''} />
}))
jest.mock('@components/PostHeader', () => ({
  PostHeader: ({ title }: any) => <h2>{title}</h2>
}))
jest.mock('@components/PostBody', () => ({ PostBody: () => <div /> }))
jest.mock('@components/Sidebar', () => ({ Sidebar: () => <aside /> }))
jest.mock('@components/Share', () => ({ Share: () => <div /> }))
jest.mock('@components/FbComments', () => ({ FbComments: () => <div /> }))
jest.mock('@components/Newsletter', () => ({ Newsletter: () => <div /> }))

describe('LoaderSinglePost', () => {
  test('loads and renders next posts when in view', async () => {
    render(<LoaderSinglePost slug='news' title='Mi Post' />)
    expect(
      await screen.findByRole('heading', { level: 2, name: /otro post/i })
    ).toBeInTheDocument()
  })
})
