import { fireEvent, render, screen } from '@testing-library/react'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { HomeImage } from '../HomeImage'

const image = {
  node: {
    sourceUrl: 'https://cdn.noticiascol.com/photo.jpg',
    srcSet:
      'https://cdn.noticiascol.com/photo-320.jpg 320w, https://cdn.noticiascol.com/photo-660.jpg 660w'
  }
}

it('reserves its picture without fetching before proximity, then keeps the loaded image', () => {
  const { container } = render(<HomeImage image={image} title='Noticia' />)
  expect(container.querySelector('picture')).toBeInTheDocument()
  expect(container.querySelector('source')).toBeNull()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  mockAllIsIntersecting(true)
  const loaded = screen.getByRole('img', { name: 'Noticia' })
  expect(loaded).toHaveAttribute('loading', 'lazy')
  expect(loaded).toHaveAttribute(
    'src',
    'https://cdn.noticiascol.com/photo-660.jpg'
  )
  expect(container.querySelector('source')).toHaveAttribute(
    'srcset',
    image.node.srcSet
  )
  mockAllIsIntersecting(false)
  expect(screen.getByRole('img')).toBe(loaded)
})

it('renders a critical image immediately without waiting for observation', () => {
  render(<HomeImage image={image} title='Portada' critical />)
  expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high')
})

it('restores responsive candidates when a failed regional image changes', () => {
  const { container, rerender } = render(
    <HomeImage image={image} title='Noticia' critical />
  )
  fireEvent.error(screen.getByRole('img'))
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    '/media/logo-plain.png'
  )
  expect(container.querySelector('source')).toBeNull()
  rerender(
    <HomeImage
      image={{
        node: {
          ...image.node,
          sourceUrl: 'https://cdn.noticiascol.com/new.jpg',
          srcSet: 'https://cdn.noticiascol.com/new-660.jpg 660w'
        }
      }}
      title='Nueva noticia'
      critical
    />
  )
  expect(container.querySelector('source')).toHaveAttribute(
    'srcset',
    expect.stringContaining(
      encodeURIComponent('https://cdn.noticiascol.com/new-660.jpg')
    )
  )
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    expect.stringContaining(
      encodeURIComponent('https://cdn.noticiascol.com/new-660.jpg')
    )
  )
})

it('still loads editorial images when IntersectionObserver is unavailable', () => {
  const observer = window.IntersectionObserver
  // Exercise the browser capability boundary without replacing the hook.
  Reflect.deleteProperty(window, 'IntersectionObserver')
  try {
    render(<HomeImage image={image} title='Sin observador' />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  } finally {
    window.IntersectionObserver = observer
  }
})

it('offers optimized responsive URLs instead of a large original for the critical editorial picture', () => {
  const original = 'https://cdn.noticiascol.com/large-original.jpg'
  const { container } = render(
    <HomeImage
      image={{
        node: {
          sourceUrl: original,
          srcSet: `https://cdn.noticiascol.com/derived-660.jpg 660w, ${original} 1120w`
        }
      }}
      title='Original grande'
      width={1134}
      sizes='calc(100vw - 32px)'
      critical
    />
  )
  const responsive = container.querySelector('source')?.getAttribute('srcset')
  expect(responsive).toContain('/_next/image?url=')
  expect(responsive).toContain(encodeURIComponent(original))
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    expect.stringContaining('/_next/image?url=')
  )
})
