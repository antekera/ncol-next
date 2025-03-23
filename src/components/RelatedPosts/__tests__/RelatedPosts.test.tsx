import { render, screen } from '@testing-library/react'
import { RelatedPosts } from '..'

const post = {
  title: 'Lorem ipsum',
  slug: 'lorem-ipsum',
  date: '2023-04-05T17:28:55',
  featuredImage: {
    node: {
      sourceUrl: 'https://i0.wp.com/'
    }
  },
  categories: {
    edges: [
      {
        node: {
          name: 'Nacionales',
          uri: '/category/nacionales/',
          slug: 'nacionales'
        }
      }
    ]
  },
  uri: '/2023/'
}

const singlePost = {
  edges: [
    {
      node: post
    }
  ]
}

const posts = {
  edges: [
    {
      node: { ...post, uri: '/2023/' }
    },
    {
      node: { ...post, uri: '/2022/' }
    },
    {
      node: { ...post, uri: '/2021/' }
    }
  ]
}

describe('RelatedPosts', () => {
  test('should not show if has less than 3 posts', () => {
    const { container } = render(<RelatedPosts posts={singlePost} />)
    expect(container.firstChild).toBeNull()
  })

  test('should  show if  less  3 posts', () => {
    const { container } = render(<RelatedPosts posts={posts} />)
    expect(screen.getByText('Más información')).toBeInTheDocument()
    expect(screen.getAllByText('Lorem ipsum').length).toBe(3)
    expect(container.firstChild).toBeDefined()
  })
})
