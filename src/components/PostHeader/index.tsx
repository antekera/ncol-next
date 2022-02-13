import Link from 'next/link'

import { Date, Container, PostTitle } from 'components/'
import Categories from 'components/categories'
import { PostHeader as PostHeaderProps } from 'lib/types'

const defaultProps = {}

const PostHeader = ({ title, date, categories }: PostHeaderProps) => {
  return (
    <Container>
      <Link href={'@!'}>
        <a
          className='relative inline-block px-1 pt-1 text-xs leading-none text-white uppercase rounded top-4 bg-primary hover:bg-secondary ease-in-out duration-200 border-primary hover:border-secondary sm:hidden pb-[3px]'
          aria-label={'Costa Oriental'}
        >
          Costa Oriental
        </a>
      </Link>
      <PostTitle title={title} />
      <p className='mb-6 -mt-2 md:text-xl md:-mt-7 text-slate-500 md:mb-12 leading-5 md:leading-6 sm:w-11/12'>
        “It’s definitely a more complicated Olympics,” said American snowboarder
        Jamie Anderson.
      </p>

      <div className='max-w-2xl'>
        <div className='mb-6 text-sm md:text-lg'>
          Posted <Date dateString={date} />
          <Categories categories={categories} />
        </div>
      </div>
    </Container>
  )
}

PostHeader.defaultProps = defaultProps

export { PostHeader }
export type { PostHeaderProps }
