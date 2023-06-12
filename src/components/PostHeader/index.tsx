import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { Share } from '@components/Share'
import { PostHeader as PostHeaderProps } from '@lib/types'

const PostHeader = ({
  title,
  date,
  categories,
  antetituloNoticia,
  fuenteNoticia
}: PostHeaderProps) => {
  return (
    <Container>
      <PostCategories
        slice={4}
        className='px-1 pt-1 ml-1 text-white uppercase rounded top-6 bg-primary hover:bg-slate-400 hover:text-white border-primary hover:border-solid border-secondary pb-[3px]'
        {...categories}
      />
      <h1 className='mt-10 mb-4 text-2xl leading-tight sm:text-3xl sm:w-11/12 md:mt-12 md:mb-10 md:text-5xl lg:text-5xl font-sans_medium text-slate-700'>
        {title}
      </h1>
      {antetituloNoticia && (
        <p className='pt-3 mb-6 -mt-6 font-sans md:text-xl lg:text-2xl md:-mt-6 md:mb-7 text-slate-500 leading-6 sm:w-11/12'>
          {antetituloNoticia}
        </p>
      )}
      <div className='w-full pt-4 pb-2 font-sans text-sm border-t border-solid md:flex md:justify-between text-slate-500 border-slate-200'>
        <div className='pr-2'>
          <DateTime dateString={date} />
          {fuenteNoticia && fuenteNoticia !== '-' && (
            <div className='inline'>
              <span className='pl-2 pr-3'>|</span>
              <span>Con información de </span>
              {fuenteNoticia}
            </div>
          )}
        </div>
        <div className='hidden pt-2 md:block md:pt-0'>
          <Share />
        </div>
      </div>
    </Container>
  )
}

export { PostHeader }
export type { PostHeaderProps }
