import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { Share } from '@components/Share'
import { Skeleton } from '@components/ui/skeleton'
import { PostHeader as PostHeaderProps } from '@lib/types'

const PostHeader = ({
  title,
  date,
  categories,
  antetituloNoticia,
  fuenteNoticia,
  isLoading
}: PostHeaderProps) => {
  return (
    <Container>
      {isLoading ? (
        <div className='bg-primary mt-1 ml-1 h-4 w-12 rounded-sm'></div>
      ) : (
        <PostCategories
          slice={4}
          className='border-primary border-secondary bg-primary top-6 ml-1 rounded-sm px-1 pt-1 pb-[3px] text-white uppercase hover:border-solid hover:bg-slate-400 hover:text-white'
          {...categories}
        />
      )}
      {isLoading ? (
        <div className='flex flex-col space-y-4 py-6 md:py-8'>
          <Skeleton className='h-10 w-5/6 rounded-sm' />
          <Skeleton className='h-10 w-4/5 rounded-sm' />
        </div>
      ) : (
        <h1 className='mt-10 mb-4 font-sans text-2xl leading-9 font-bold text-slate-700 sm:w-11/12 sm:text-3xl md:mt-12 md:mb-10 md:text-3xl lg:text-5xl lg:leading-14'>
          {title}
        </h1>
      )}
      {antetituloNoticia && (
        <p className='-mt-6 mb-6 pt-5 font-sans leading-6 text-slate-500 sm:w-11/12 md:-mt-6 md:mb-7 md:pt-3 md:text-xl'>
          {antetituloNoticia}
        </p>
      )}
      <div className='w-full border-t border-solid border-slate-200 pt-4 pb-2 font-sans text-sm text-slate-500 md:flex md:justify-between'>
        <div className='pr-2'>
          {isLoading ? (
            <Skeleton className='h-4 w-28 rounded-sm' />
          ) : (
            <DateTime dateString={date} />
          )}
          {fuenteNoticia && fuenteNoticia !== '-' && (
            <div className='inline'>
              <span className='pr-3 pl-2'>|</span>
              <span>Con información de </span>
              {fuenteNoticia}
            </div>
          )}
        </div>
        <div className='hidden pt-2 whitespace-nowrap md:block md:pt-0'>
          <Share />
        </div>
      </div>
    </Container>
  )
}

export { PostHeader }
