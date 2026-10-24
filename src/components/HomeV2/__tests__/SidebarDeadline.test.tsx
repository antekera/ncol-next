import { act, render, screen } from '@testing-library/react'
import useSWR from 'swr'
import { DailyBoundary } from '../DailyBoundary'
import { RankingWidget, OpinionWidget } from '../SidebarFeeds'
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      posts: [
        {
          slug: '/dated/',
          title: 'Jornada del 23 de octubre de 2026',
          homeArticleId: 'dated'
        },
        {
          slug: '/ordinary/',
          title: 'Ranking sin fecha',
          homeArticleId: 'ordinary'
        }
      ]
    }
  }))
}))
jest.mock('@lib/hooks/data/useOpinionAuthors', () => ({
  useOpinionAuthors: () => ({
    authors: [
      {
        name: 'Autor uno',
        slug: 'uno',
        uri: '/autor/uno/',
        avatarUrl: null,
        latestPost: {
          id: 'dated-opinion',
          uri: '/dated-opinion/',
          title: 'Jornada del 23 de octubre de 2026'
        }
      },
      {
        name: 'Autor dos',
        slug: 'dos',
        uri: '/autor/dos/',
        avatarUrl: null,
        latestPost: {
          id: 'ordinary-opinion',
          uri: '/ordinary-opinion/',
          title: 'Opinión sin fecha'
        }
      }
    ],
    isLoading: false
  })
}))
it('expires loaded ranking and opinion rows at midnight without changing the feed key', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-24T03:59:59Z'))
  try {
    const { container } = render(
      <DailyBoundary initialNow={Date.now()} deadlines={[]}>
        <RankingWidget />
        <OpinionWidget />
      </DailyBoundary>
    )
    expect(
      screen.getAllByText('Jornada del 23 de octubre de 2026')
    ).toHaveLength(2)
    act(() => jest.advanceTimersByTime(1000))
    expect(
      screen.queryAllByText('Jornada del 23 de octubre de 2026')
    ).toHaveLength(0)
    expect(screen.getByText('Ranking sin fecha')).toBeVisible()
    expect(screen.getByText('Opinión sin fecha')).toBeVisible()
    for (const row of container.querySelectorAll('[data-article-id]'))
      expect(row).toHaveAttribute('data-item-position', '1')
    expect(
      jest
        .mocked(useSWR)
        .mock.calls.every(
          ([key]) => key === '/api/most-visited?limit=50&days=7'
        )
    ).toBe(true)
  } finally {
    jest.useRealTimers()
  }
})
