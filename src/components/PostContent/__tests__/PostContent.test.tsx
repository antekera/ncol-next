/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { PostContent } from '..'
import { TAG_PATH } from '@lib/constants'
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))

jest.mock('@components/CoverImage', () => ({
  CoverImage: ({ title }: { title: string }) => <img alt={title} />
}))
jest.mock('@components/Sidebar', () => ({ Sidebar: () => <aside /> }))
jest.mock('@components/PostHeader', () => ({
  PostHeader: ({ title }: { title: string }) => <h1>{title}</h1>
}))
jest.mock('@components/PostBody', () => ({
  PostBody: ({ firstParagraph, secondParagraph }: any) => (
    <div>
      <p>{firstParagraph}</p>
      <p>{secondParagraph}</p>
    </div>
  )
}))
jest.mock('@components/Share', () => ({
  Share: () => <div data-testid='share' />
}))

jest.mock('@components/SocialLinks', () => ({ SocialLinks: () => <div /> }))
jest.mock('@components/Newsletter', () => ({ Newsletter: () => <div /> }))
jest.mock('@components/RelatedPosts', () => ({ RelatedPosts: () => <div /> }))
jest.mock('@components/RelatedPostsSlider', () => ({
  RelatedPostsSlider: () => <div />
}))
jest.mock('@components/SummaryAccordion', () => ({
  SummaryAccordion: ({ summary }: { summary: string }) => (
    <div data-testid='summary-accordion'>{summary}</div>
  )
}))
jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))
import { GAEvent } from '@lib/utils'

describe('PostContent', () => {
  const base = {
    categories: { edges: [], type: '' },
    customFields: { fuenteNoticia: 'Fuente ACME' },
    date: '2025-01-10',
    featuredImage: { node: { sourceUrl: '/a.jpg', srcSet: '' } },
    firstParagraph: 'Primero',
    secondParagraph: 'Segundo',
    sidebarContent: undefined,
    tags: {
      edges: [
        { node: { name: 'x', slug: 'tag-1', id: '1' } },
        { node: { name: 'y', slug: 'tag-2', id: '2' } }
      ]
    },
    title: 'Titulo',
    uri: '/post/slug',
    slug: 'slug',
    rawSlug: 'raw'
  }

  test('renders header, image, body and share for mobile', () => {
    render(<PostContent {...base} />)
    expect(screen.getByRole('heading', { name: 'Titulo' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Titulo' })).toBeInTheDocument()
    expect(screen.getByText('Primero')).toBeInTheDocument()
    expect(screen.getByText('Segundo')).toBeInTheDocument()
    expect(screen.getByTestId('share')).toBeInTheDocument()
  })

  test('renders tag links with correct href', () => {
    render(<PostContent {...base} />)
    expect(screen.getByRole('link', { name: '#x' })).toHaveAttribute(
      'href',
      `${TAG_PATH}/tag-1`
    )
    expect(screen.getByRole('link', { name: '#y' })).toHaveAttribute(
      'href',
      `${TAG_PATH}/tag-2`
    )
  })

  test('renders summary accordion when resumenIa is present', () => {
    const propsWithSummary = {
      ...base,
      customFields: {
        ...base.customFields,
        resumenIa: 'This is an AI summary'
      }
    }
    render(<PostContent {...propsWithSummary} />)
    expect(screen.getByTestId('summary-accordion')).toBeInTheDocument()
    expect(screen.getByText('This is an AI summary')).toBeInTheDocument()
  })

  test('calls GAEvent when tag is clicked', () => {
    render(<PostContent {...base} />)
    const tagLink = screen.getByRole('link', { name: '#x' })
    tagLink.click()
    expect(GAEvent).toHaveBeenCalled()
  })
})
