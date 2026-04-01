import { render, screen } from '@testing-library/react'
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
  ],
  type: 'post'
}

describe('PostCategories', () => {
  test('should render categories correctly', () => {
    render(<PostCategories {...props} />)
    expect(screen.getByText('sucesos')).toBeInTheDocument()
  })
})
