import { render } from '@testing-library/react'
import { PostCategories } from '..'

const props = {
  edges: [
    {
      node: {
        name: 'sucesos',
        uri: 'sucesos',
        slug: 'sucesos',
        categoryId: '1234'
      }
    }
  ]
}

describe('PostCategories', () => {
  test('should match snapshots', () => {
    const { container } = render(<PostCategories {...props} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
