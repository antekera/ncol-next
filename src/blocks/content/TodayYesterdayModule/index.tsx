import {
  TodayPost,
  TodayPostsResult
} from '@app/actions/getTodayYesterdayPosts'
import { TodayHeroPost } from '@components/TodayHeroPost'
import { TodayNewsCard } from '@components/TodayNewsCard'

interface Props {
  posts: TodayPostsResult
}

export function getSecondaryPosts(
  edges: TodayPostsResult['edges']
): TodayPost[] {
  if (edges.length < 3) return []
  const raw = edges.slice(1).map(({ node }) => node)
  const capped = Math.min(raw.length, 6)
  // Round down to nearest multiple of 3 so the grid never has an orphan card.
  const rounded = Math.floor(capped / 3) * 3
  return raw.slice(0, rounded)
}

// Full-width hero — rendered outside the sidebar Container
const TodayHeroSection = ({ posts }: Props) => {
  const heroPost = posts.edges[0]?.node
  if (!heroPost) return null

  return (
    <div className='container mx-auto px-6 pt-0 sm:px-7 sm:pt-6'>
      <TodayHeroPost {...heroPost} />
    </div>
  )
}

// Secondary cards grid — rendered inside the sidebar column
const TodaySecondaryGrid = ({ posts }: Props) => {
  const secondaryPosts = getSecondaryPosts(posts.edges)
  if (secondaryPosts.length === 0) return null

  const mobileColClass =
    secondaryPosts.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3'

  return (
    <section className='mb-8'>
      <hr className='mb-4 border-slate-200 dark:border-neutral-600' />
      <div className={`grid gap-4 ${mobileColClass}`}>
        {secondaryPosts.map(post => (
          <TodayNewsCard key={post.id} {...post} />
        ))}
      </div>
    </section>
  )
}

export { TodayHeroSection, TodaySecondaryGrid }
