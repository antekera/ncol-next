'use client'

import useSWR from 'swr'

interface RankedPost {
  slug: string
  title: string
  image: string
}

export interface SidebarRankingsApiResponse {
  mostRead: RankedPost[]
  mostViewedToday: RankedPost[]
}

export const useSidebarRankings = ({ load }: { load: boolean }) => {
  const { data, error, isLoading } = useSWR<SidebarRankingsApiResponse>(
    load ? 'sidebar-rankings' : null,
    async () => {
      const getRankedPosts = async (days: number) => {
        const response = await fetch(`/api/most-visited?limit=5&days=${days}`)
        if (!response.ok) {
          throw new Error(
            `Sidebar rankings request failed with ${response.status}`
          )
        }
        const result = (await response.json()) as { posts: RankedPost[] }
        return result.posts
      }

      const [mostRead, mostViewedToday] = await Promise.all([
        getRankedPosts(5),
        getRankedPosts(1)
      ])

      return {
        mostRead,
        mostViewedToday
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 60 * 1000,
      keepPreviousData: true
    }
  )

  return { data, error, isLoading }
}
