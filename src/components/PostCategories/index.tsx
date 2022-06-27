import Link from 'next/link'

import { CATEGORY_PATH } from 'lib/constants'

import { Categories as PostCategoriesProps } from '../../lib/types'

const PostCategories = ({ edges }: PostCategoriesProps) => {
  return (
    <span className='ml-1'>
      {edges && edges.length > 0
        ? edges
            .reverse()
            .slice(0, 2)
            .map(({ node: { name, slug } }, index) => (
              <Link key={index} href={`${CATEGORY_PATH}/${slug}/`}>
                <a
                  className='relative inline-block px-1 pt-1 mr-2 text-xs leading-none text-white uppercase rounded top-6 bg-primary hover:bg-secondary ease-in-out duration-200 border-primary hover:border-secondary pb-[3px]'
                  aria-label={name}
                >
                  {name}
                </a>
              </Link>
            ))
        : null}
    </span>
  )
}

export { PostCategories }
export type { PostCategoriesProps }
