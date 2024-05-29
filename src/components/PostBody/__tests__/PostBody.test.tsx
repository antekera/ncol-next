import { render } from '@testing-library/react'

import { PostBody } from '..'

describe('PostBody', () => {
  test('should match snapshots', () => {
    const { container } = render(
      <PostBody
        firstParagraph='<p>Lorem ipsum</p>'
        secondParagraph='<p>Lorem ipsum</p>'
        style={{}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
