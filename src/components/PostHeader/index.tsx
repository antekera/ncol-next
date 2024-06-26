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
        <div className='ml-1 mt-1 h-4 w-12 rounded bg-primary'></div>
      ) : (
        <PostCategories
          slice={4}
          className='top-6 ml-1 rounded border-primary border-secondary bg-primary px-1 pb-[3px] pt-1 uppercase text-white hover:border-solid hover:bg-slate-400 hover:text-white'
          {...categories}
        />
      )}
      {isLoading ? (
        <div className='flex flex-col space-y-4 py-6 md:py-8'>
          <Skeleton className='h-10 w-5/6 rounded' />
          <Skeleton className='h-10 w-4/5 rounded' />
        </div>
      ) : (
        <h1 className='mb-4 mt-10 font-sans_medium text-2xl leading-tight text-slate-700 sm:w-11/12 sm:text-3xl md:mb-10 md:mt-12 md:text-5xl lg:text-5xl'>
          {title}
        </h1>
      )}
      {antetituloNoticia && (
        <p className='-mt-6 mb-6 pt-3 font-sans leading-6 text-slate-500 sm:w-11/12 md:-mt-6 md:mb-7 md:text-xl lg:text-2xl'>
          {antetituloNoticia}
        </p>
      )}
      <div className='w-full border-t border-solid border-slate-200 pb-2 pt-4 font-sans text-sm text-slate-500 md:flex md:justify-between'>
        <div className='pr-2'>
          {isLoading ? (
            <Skeleton className='h-4 w-28 rounded' />
          ) : (
            <DateTime dateString={date} />
          )}
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
