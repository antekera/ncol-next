import type { ComponentProps } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { ArticleCard } from '../ArticleCard'
import { Opening } from '../Opening'
import { Section } from '../Section'
import type { HomeArticle, HomeSection } from '@lib/homeV2/types'

// Keep the link boundary literal; Next's unit runtime has no production
// trailingSlash substitution. Production URLs are checked in browser QA.
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: ComponentProps<'a'>) => (
    <a href={href} aria-label={props['aria-label']} className={props.className}>
      {children}
    </a>
  )
}))

const post: HomeArticle = {
  id: 'post-1',
  uri: '/zulia/10/17/noticia/',
  title: 'Zulia impulsa proyectos para mejorar la infraestructura vial',
  excerpt: '<p>Un plan para las vías del estado. [&hellip;]</p>',
  date: '2026-10-17T12:00:00',
  categories: { edges: [{ node: { name: 'Zulia', slug: 'zulia' } }] },
  featuredImage: {
    node: {
      sourceUrl: 'https://cdn.noticiascol.com/road.jpg',
      srcSet: 'https://cdn.noticiascol.com/road-660.jpg 660w'
    }
  }
}
const section: HomeSection = {
  id: 'zulia',
  title: 'Todo Zulia',
  categorySlug: 'zulia',
  position: 2,
  presentation: 'regional',
  limit: 7,
  href: '/categoria/zulia/',
  includeDescendants: true,
  articles: [post]
}
it('renders a linked editorial card with stable module, article and placement metadata', () => {
  const { container } = render(
    <ArticleCard article={post} module={section} position={1} />
  )
  expect(screen.getByRole('link', { name: post.title })).toHaveAttribute(
    'href',
    post.uri
  )
  const card = container.querySelector('article')
  expect(card).toHaveAttribute('data-module-id', 'zulia')
  expect(card).toHaveAttribute('data-article-id', 'post-1')
  expect(card).toHaveAttribute('data-item-position', '1')
  expect(card).toHaveAttribute('data-editorial-position', '2')
  mockAllIsIntersecting(true)
  expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
})
it('renders one h1 and prioritizes only the photographic opening image', () => {
  render(
    <Opening
      featured={post}
      secondary={[
        {
          ...post,
          id: 'p2',
          uri: '/otra/',
          title: 'Otra noticia de la portada'
        }
      ]}
    />
  )
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    post.title
  )
  const photos = screen.getAllByRole('img')
  expect(
    photos.filter(img => img.getAttribute('fetchpriority') === 'high')
  ).toHaveLength(1)
  expect(screen.getByText('Un plan para las vías del estado.')).toBeVisible()
})
it('uses the traditional opening without missing-image markup and switches after an image error', () => {
  const { container, rerender } = render(
    <Opening featured={{ ...post, featuredImage: null }} secondary={[]} />
  )
  expect(container.querySelector('[data-opening-treatment]')).toHaveAttribute(
    'data-opening-treatment',
    'traditional'
  )
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  rerender(<Opening featured={post} secondary={[]} />)
  fireEvent.error(screen.getByRole('img'))
  expect(container.querySelector('[data-opening-treatment]')).toHaveAttribute(
    'data-opening-treatment',
    'traditional'
  )
})
it('renders the section link and a clear empty state without fake article impressions', () => {
  const { container } = render(
    <Section section={{ ...section, articles: [] }} />
  )
  expect(
    screen.getByRole('link', { name: 'Ver más de Todo Zulia' })
  ).toHaveAttribute('href', '/categoria/zulia/')
  expect(
    screen.getByText('No hay noticias disponibles en este momento.')
  ).toBeVisible()
  expect(container.querySelector('article')).toBeNull()
})
