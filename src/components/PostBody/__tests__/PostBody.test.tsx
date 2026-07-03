import { render, screen } from '@testing-library/react'
import { PostBody } from '..'
import { GA_EVENTS } from '@lib/constants'

jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))

import { GAEvent } from '@lib/utils'

describe('PostBody', () => {
  test('should match snapshots', () => {
    const { container } = render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Lorem ipsum</p>'
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders inline related post link between paragraphs', () => {
    render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Dolor sit amet</p>'
        inlineRelatedPost={{
          title: 'Nota relacionada',
          uri: '/2026/07/02/nota-relacionada/',
          featuredImage: {
            node: {
              sourceUrl: '/thumb.jpg',
              srcSet: '/thumb.jpg 175w'
            }
          }
        }}
      />
    )

    expect(screen.getByText('Lee también')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /nota relacionada/i })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Nota relacionada' })
    ).toHaveLength(2)
    screen
      .getAllByRole('link', { name: 'Nota relacionada' })
      .forEach(link =>
        expect(link).toHaveAttribute('href', '/2026/07/02/nota-relacionada')
      )
  })

  test('tracks clicks on inline related image and title', () => {
    render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Dolor sit amet</p>'
        inlineRelatedPost={{
          title: 'Nota relacionada',
          uri: '/2026/07/02/nota-relacionada/',
          featuredImage: {
            node: {
              sourceUrl: '/thumb.jpg',
              srcSet: '/thumb.jpg 175w'
            }
          }
        }}
      />
    )

    const [imageLink, titleLink] = screen.getAllByRole('link', {
      name: 'Nota relacionada'
    })

    imageLink.click()
    titleLink.click()

    expect(GAEvent).toHaveBeenNthCalledWith(1, {
      category: GA_EVENTS.INLINE_RELATED_POST.CATEGORY,
      label: GA_EVENTS.INLINE_RELATED_POST.CLICK_IMAGE
    })
    expect(GAEvent).toHaveBeenNthCalledWith(2, {
      category: GA_EVENTS.INLINE_RELATED_POST.CATEGORY,
      label: GA_EVENTS.INLINE_RELATED_POST.CLICK_TITLE
    })
  })

  test('renders inline related title without image when thumbnail is missing', () => {
    render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Dolor sit amet</p>'
        inlineRelatedPost={{
          title: 'Solo texto relacionado',
          uri: '/2026/07/02/solo-texto-relacionado/'
        }}
      />
    )

    expect(screen.getByText('Lee también')).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: /solo texto relacionado/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Solo texto relacionado' })
    ).toHaveLength(1)
  })
})
