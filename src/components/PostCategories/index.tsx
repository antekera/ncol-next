import { useEffect } from 'react'

import Link from 'next/link'

import { CATEGORY_PATH } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { Category, Categories as PostCategoriesProps } from '@lib/types'
import { titleFromSlug } from '@lib/utils'

const categories: Category[] = []
const FILTERED_CATEGORIES = [
  '_Pos_Columna_der',
  '_Pos_Columna_izq',
  '_Pos_Destacado'
]

const PostCategories = ({ edges }: PostCategoriesProps) => {
  const { setPageSetupState } = usePageStore()

  useEffect(() => {
    edges.map(({ node: { name, slug } }) => {
      if (FILTERED_CATEGORIES.includes(name)) return null
      categories.push({ name, slug })
    })

    setPageSetupState({
      currentCategory: categories[0]
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span className='ml-1'>
      {categories.length > 0
        ? categories.slice(0, 2).map(({ name, slug }, index) => (
            <Link key={index} href={`${CATEGORY_PATH}/${slug}/`}>
              <a
                className='relative inline-block px-1 pt-1 mr-2 text-xs leading-none text-white uppercase rounded top-6 bg-primary hover:bg-slate-400 hover:text-white border-primary hover:border-solid border-secondary pb-[3px]'
                aria-label={name}
              >
                {titleFromSlug(name)}
              </a>
            </Link>
          ))
        : null}
    </span>
  )
}

export { PostCategories }
export type { PostCategoriesProps }
