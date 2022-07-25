import { useState, useEffect } from 'react'

import cn from 'classnames'
import Link from 'next/link'

import { CATEGORY_PATH } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { Category, Categories as PostCategoriesProps } from '@lib/types'

const categoriesList: Category[] = []
const FILTERED_CATEGORIES = [
  '_Pos_Columna_der',
  '_Pos_Columna_izq',
  '_Pos_Destacado'
]

const defaultProps = {
  slice: 2
}

const PostCategories = ({ edges, className, slice }: PostCategoriesProps) => {
  const [categories, setCategories] = useState(categoriesList)
  const { setPageSetupState } = usePageStore()

  const classes = cn(
    'relative inline-block leading-none uppercase mr-2 text-xs',
    className
  )

  useEffect(() => {
    edges.map(({ node: { name, slug } }) => {
      if (FILTERED_CATEGORIES.includes(name)) return null
      categoriesList.push({ name, slug })
    })

    setCategories(categoriesList)
    setPageSetupState({
      currentCategory: categoriesList[0]
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {categories.length > 0
        ? categories.slice(0, slice).map(({ name, slug }, index) => (
            <Link key={index} href={`${CATEGORY_PATH}/${slug}/`}>
              <a className={classes} aria-label={name}>
                {name}
              </a>
            </Link>
          ))
        : null}
    </>
  )
}

PostCategories.defaultProps = defaultProps

export { PostCategories }
export type { PostCategoriesProps }
