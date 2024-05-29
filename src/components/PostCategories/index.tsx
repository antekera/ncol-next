'use client'

import Link from 'next/link'

import { CATEGORY_PATH, FILTERED_CATEGORIES } from '@lib/constants'
import { cn } from '@lib/shared'
import { Categories as PostCategoriesProps } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

const PostCategories = ({
  edges,
  className,
  slice = 2
}: PostCategoriesProps) => {
  const classes = cn(
    'link-post-category relative mr-2 inline-block font-sans text-xs leading-none',
    className
  )

  return (
    <>
      {edges && edges.length > 0
        ? edges.slice(0, slice).map(({ node }, index) =>
            FILTERED_CATEGORIES.includes(node.name) ? null : (
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
          )
        : null}
    </>
  )
}

export { PostCategories }
