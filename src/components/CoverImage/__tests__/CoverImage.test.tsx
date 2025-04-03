import { render } from '@testing-library/react'
import { CoverImage } from '..'

const props = {
  coverImage: '/image.png',
  title: 'Image title',
  uri: '/image.png'
}

describe('CoverImage', () => {
  test('should match snapshots', () => {
    const { container } = render(<CoverImage {...props} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should display image without link', () => {
    const { container } = render(<CoverImage {...props} uri='' />)
    expect(container.firstChild).not.toHaveAttribute('href', props.uri)
  })
})
