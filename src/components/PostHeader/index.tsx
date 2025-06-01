import { Container } from '@components/Container'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { Share } from '@components/Share'
import { Skeleton } from '@components/ui/skeleton'
import { PostHeader as PostHeaderProps } from '@lib/types'
import { VisitCounter } from '@components/VisitCounter'

const PostHeader = ({
  antetituloNoticia,
  categories,
  date,
  isLoading,
  fuenteNoticia,
  title,
  uri,
  rawSlug
}: PostHeaderProps) => {
  return (
    <Container>
      {isLoading ? (
        <div className='bg-primary mt-1 ml-1 h-4 w-12 rounded-sm'></div>
      ) : (
        <PostCategories
          slice={4}
          className='border-primary bg-primary top-6 ml-1 rounded-sm px-1 pt-1 pb-[3px] text-white uppercase hover:border-solid hover:bg-slate-400 hover:text-white'
          {...categories}
        />
      )}
      {isLoading ? (
        <div className='flex flex-col space-y-4 py-6 md:py-8'>
          <Skeleton className='h-10 w-5/6 rounded-sm' />
          <Skeleton className='h-10 w-4/5 rounded-sm' />
        </div>
      ) : (
        <h1 className='mt-10 mb-4 font-sans text-2xl leading-9 font-bold text-slate-700 sm:w-11/12 sm:text-3xl md:mt-12 md:mb-10 md:text-3xl lg:text-5xl lg:leading-14 dark:text-neutral-300'>
          {title}
        </h1>
      )}
      {antetituloNoticia && (
        <p className='-mt-6 mb-6 pt-5 font-sans text-sm leading-6 text-slate-500 sm:w-11/12 md:-mt-6 md:mb-7 md:pt-3 md:text-lg dark:text-neutral-300 dark:text-slate-400'>
          {antetituloNoticia}
        </p>
      )}
      <div
        className={`w-full border-t border-solid border-slate-200 pt-4 pb-2 font-sans text-sm text-slate-500 md:flex md:justify-between dark:border-neutral-500 dark:text-neutral-300`}
      >
        <div className='flex pr-2'>
          {isLoading ? (
            <Skeleton className='h-4 w-28 rounded-sm' />
          ) : (
            <>
              <DateTime dateString={date} />
              {rawSlug && fuenteNoticia !== '-' && (
                <VisitCounter slug={rawSlug} dateString={date} />
              )}
            </>
          )}
        </div>
        <div className='hidden pt-2 whitespace-nowrap md:block md:pt-0'>
          <Share uri={uri ?? ''} />
        </div>
      </div>
    </Container>
  )
}

export { PostHeader }
