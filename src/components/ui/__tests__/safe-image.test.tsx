import { render, screen, fireEvent } from '@testing-library/react'
import { SafeImage } from '../safe-image'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    onError,
    unoptimized
  }: {
    src: string
    alt: string
    onError?: React.ReactEventHandler<HTMLImageElement>
    unoptimized?: boolean
  }) => (
    <img
      src={src}
      alt={alt}
      data-unoptimized={unoptimized ? 'true' : 'false'}
      onError={onError}
    />
  )
}))

describe('SafeImage', () => {
  it('bypasses next/image optimization for noticiascol CDN images', () => {
    render(
      <SafeImage
        src='https://cdn.noticiascol.com/wp-content/uploads/2021/05/pacman.jpg'
        alt='Imagen'
        width={300}
        height={200}
      />
    )

    expect(screen.getByAltText('Imagen')).toHaveAttribute(
      'data-unoptimized',
      'true'
    )
  })

  it('swaps to a local fallback when the remote image fails', () => {
    render(
      <SafeImage
        src='https://cdn.noticiascol.com/wp-content/uploads/2021/05/pacman.jpg'
        alt='Imagen'
        width={300}
        height={200}
      />
    )

    const image = screen.getByAltText('Imagen')
    fireEvent.error(image)

    expect(screen.getByAltText('Imagen')).toHaveAttribute(
      'src',
      '/media/logo-plain.png'
    )
    expect(screen.getByAltText('Imagen')).toHaveAttribute(
      'data-unoptimized',
      'true'
    )
  })

  it('hides the image if the fallback also fails', () => {
    render(
      <SafeImage
        src='https://cdn.noticiascol.com/wp-content/uploads/2021/05/pacman.jpg'
        alt='Imagen'
        width={300}
        height={200}
      />
    )

    fireEvent.error(screen.getByAltText('Imagen'))
    fireEvent.error(screen.getByAltText('Imagen'))

    expect(screen.queryByAltText('Imagen')).not.toBeInTheDocument()
  })
})
