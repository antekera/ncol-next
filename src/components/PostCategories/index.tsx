'use client'

import Link from 'next/link'
import { CATEGORY_PATH, GA_EVENTS } from '@lib/constants'
import { Categories as PostCategoriesProps } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'
import { processCategories } from '@lib/utils/processCategories'
import { getPostCategoriesClasses } from './styles'

const PostCategories = ({
  edges,
  className,
  slice = 2,
  type
}: PostCategoriesProps) => {
  const classes = getPostCategoriesClasses(className)
  const processedEdges = processCategories(edges, slice)

  return (
    <>
      {processedEdges.map(({ node }, index) => {
        return (
          <Link
            key={index}
            href={`${CATEGORY_PATH}/${node.slug}/`}
            className={classes}
            aria-label={node.name}
            onClick={() =>
              GAEvent({
                category: GA_EVENTS.POST_LINK.CATEGORY.CATEGORY,
                label: `${type?.toUpperCase()}`
              })
            }
          >
            {node.name}
          </Link>
        )
      })}
    </>
  )
}

export { PostCategories }
