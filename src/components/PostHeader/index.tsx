import Link from 'next/link'

import { Date, Container, Share } from 'components/'
import Categories from 'components/categories'
import { PostHeader as PostHeaderProps } from 'lib/types'

const defaultProps = {}

const PostHeader = ({ title, date, categories }: PostHeaderProps) => {
  return (
    <Container>
      <Link href={'@!'}>
        <a
          className='relative inline-block px-1 pt-1 text-xs leading-none text-white uppercase rounded top-6 bg-primary hover:bg-secondary ease-in-out duration-200 border-primary hover:border-secondary sm:hidden pb-[3px]'
          aria-label={'Costa Oriental'}
        >
          <Categories categories={categories} />
        </a>
      </Link>
      <h1 className='mt-8 mb-8 text-3xl sm:text-4xl leading sm:w-11/12 md:mt-12 md:mb-10 md:text-5xl lg:text-6xl font-sans_medium text-slate-700'>
        {title}
      </h1>
      <p className='mb-6 -mt-6 md:text-xl lg:text-2xl md:-mt-6 md:mb-7 text-slate-500 leading-6 sm:w-11/12 font-sans_light'>
        “It’s definitely a more complicated Olympics,” said American snowboarder
        Jamie Anderson.
      </p>
      <div className='w-full pt-4 pb-2 text-sm border-t md:flex md:justify-between text-slate-500 font-sans_light border-slate-200'>
        <div className='pr-2'>
          <Date dateString={date} />
          <span className='pl-2 pr-3'>|</span>
          <span>Con información de </span>
          <a
            className='hover:text-primary'
            href='#'
            target='_blank'
            rel='noopener noreferrer'
          >
            noticiascol
          </a>
        </div>
        <div className='hidden pt-2 md:block md:pt-0'>
          <Share />
        </div>
      </div>
    </Container>
  )
}

PostHeader.defaultProps = defaultProps

export { PostHeader }
export type { PostHeaderProps }
