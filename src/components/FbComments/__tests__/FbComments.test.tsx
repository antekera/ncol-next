import { render } from '@testing-library/react'
import { FacebookProvider } from 'react-facebook'
import { FbComments } from '..'

describe('FbComments', () => {
  test('should be defined', () => {
    const { container } = render(
      <FacebookProvider appId={'123456'}>
        <FbComments uri='/lorem-ipsum-path' />
      </FacebookProvider>
    )
    expect(container.firstChild).toBeDefined()
  })
})
