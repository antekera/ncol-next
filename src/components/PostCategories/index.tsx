import { useEffect } from 'react'

import cn from 'classnames'
import Link from 'next/link'

import { CATEGORY_PATH } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { Categories as PostCategoriesProps } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

const FILTERED_CATEGORIES = [
  '_Pos_Columna_der',
  '_Pos_Columna_izq',
  '_Pos_Destacado'
]

const PostCategories = ({
  edges,
  className,
  slice = 2
}: PostCategoriesProps) => {
  const { setPageSetupState } = usePageStore()
  const classes = cn(
    'relative inline-block leading-none mr-2 text-xs link-post-category',
    className
  )

  useEffect(() => {
    const cat = edges[1] || edges[0]
    setPageSetupState({
      currentCategory: { name: cat.node.name, slug: cat.node.slug }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {edges && edges.length > 0
        ? edges.slice(0, slice).map(({ node }, index) =>
            FILTERED_CATEGORIES.includes(node.name) ? null : (
              <Link key={index} href={`${CATEGORY_PATH}/${node.slug}/`}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                <a
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
                </a>
              </Link>
            )
          )
        : null}
    </>
  )
}

export { PostCategories }
export type { PostCategoriesProps }
