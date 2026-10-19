import { render } from '@testing-library/react'
import { VideoCard } from '..'
import { getCategoryNode } from '@lib/utils/getCategoryNode'
jest.mock('@lib/utils/getCategoryNode', () => ({
  getCategoryNode: jest.fn(() => ({ name: 'Videos', slug: 'videos' }))
}))
jest.mock('@components/VideoPlayer', () => ({ VideoPlayer: () => null }))
jest.mock('@components/HoverPrefetchLink', () => ({
  HoverPrefetchLink: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  )
}))
it('does not rebuild unchanged cards when carousel controls update, but renders a changed article', () => {
  const node = {
    id: 'v1',
    uri: '/video/',
    title: 'Video uno',
    categories: { edges: [] }
  }
  const { rerender, getByText } = render(
    <VideoCard node={node} homePosition={1} />
  )
  expect(getCategoryNode).toHaveBeenCalledTimes(1)
  rerender(<VideoCard node={node} homePosition={1} />)
  expect(getCategoryNode).toHaveBeenCalledTimes(1)
  rerender(
    <VideoCard
      node={{ ...node, title: 'Video actualizado' }}
      homePosition={1}
    />
  )
  expect(getCategoryNode).toHaveBeenCalledTimes(2)
  expect(getByText('Video actualizado')).toBeVisible()
})
