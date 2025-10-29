import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoaderCategoryPosts } from '..'

describe('LoaderCategoryPosts', () => {
  const user = userEvent.setup()

  test('click disables button while loading and calls fetchMorePosts', async () => {
    jest.useRealTimers()
    const fetchMorePosts = jest.fn().mockResolvedValue({})
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })
    expect(button).not.toBeDisabled()
    await user.click(button)
    expect(fetchMorePosts).toHaveBeenCalledWith(5)
    expect(button).toBeDisabled()
  })
})
