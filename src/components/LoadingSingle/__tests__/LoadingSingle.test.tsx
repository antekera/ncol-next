import { render, screen } from '@testing-library/react'
import { Loading } from '..'

jest.mock('@components/Sidebar', () => ({ Sidebar: () => <aside /> }))
jest.mock('@components/PostHeader', () => ({
  PostHeader: ({ title }: { title: string }) => <h1>{title}</h1>
}))

describe('LoadingSingle', () => {
  test('shows computed title from slug', () => {
    render(<Loading slug='mi-post' />)
    expect(
      screen.getByRole('heading', { level: 1, name: /mi post/i })
    ).toBeInTheDocument()
  })
})
