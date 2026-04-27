import { TodayPost } from '@app/actions/getTodayYesterdayPosts'
import { getPostCategoriesClasses } from '@components/PostCategories/styles'
import { processCategories } from '@lib/utils/processCategories'
import { CATEGORY_PATH } from '@lib/constants'
import Link from 'next/link'

const TodayCategoryLabel = ({
  categories,
  className
}: {
  categories: TodayPost['categories']
  className?: string
}) => {
  const processed = processCategories(categories.edges, 1)
  if (!processed.length) return null
  const cat = processed[0]?.node
  const classes = getPostCategoriesClasses(className)
  if (!cat) return null
  return (
    <Link href={`${CATEGORY_PATH}/${cat.slug}`} className={classes}>
      {cat.name}
    </Link>
  )
}

export { TodayCategoryLabel }
