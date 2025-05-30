'use client'

import Link from 'next/link'
import { CATEGORY_PATH } from '@lib/constants'
import { cn } from '@lib/shared'
import { Categories as PostCategoriesProps } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'
import { processCategories } from '@lib/utils/processCategories'

const PostCategories = ({
  edges,
  className,
  slice = 2
}: PostCategoriesProps) => {
  const classes = cn(
    'link-post-category relative mr-2 inline-block font-sans text-xs leading-none',
    className
  )
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
                category: 'CATEGORY_POST',
                label: `POST_${node.slug?.toUpperCase()}`
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
