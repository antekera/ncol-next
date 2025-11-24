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
  featuredImage
}: PostHeaderProps) => {
  return (
    <>
      <div className={isLoading ? 'min-h-[164px] md:min-h-[232px]' : ''}>
        {isLoading ? (
          <div className='bg-primary relative top-4 mt-[2px] mb-4 ml-1 inline-block h-[20px] w-20 rounded-sm' />
        ) : (
          <PostCategories
            slice={4}
            className='border-primary bg-primary top-6 ml-1 inline-block rounded-sm px-2 py-1 leading-none text-white uppercase hover:border-solid hover:text-white'
            {...categories}
          />
        )}
        {isLoading ? (
          <div className='flex flex-col space-y-3 px-1 py-4 md:space-y-5 md:py-8'>
            <Skeleton className='h-6 w-5/6 rounded-sm md:h-8' />
            <Skeleton className='h-6 w-4/5 rounded-sm md:h-8' />
          </div>
        ) : (
          <h1 className='mt-10 mb-4 w-full font-sans text-2xl leading-9 font-bold text-slate-700 sm:text-3xl md:mt-12 md:mb-10 md:text-3xl lg:text-5xl lg:leading-14 dark:text-neutral-300'>
            {title}
          </h1>
        )}
        <p className='-mt-6 mb-6 w-full pt-5 font-sans text-sm leading-6 text-slate-500 md:-mt-6 md:mb-7 md:pt-3 md:text-lg dark:text-neutral-300'>
          {antetituloNoticia ?? ''}
        </p>
      </div>
      <div
        className={`w-full border-t border-solid border-slate-200 pt-4 pb-2 font-sans text-sm text-slate-500 md:flex md:justify-between dark:border-neutral-500 dark:text-neutral-300`}
      >
        <div className='flex pr-2'>
          {isLoading ? (
            <Skeleton className='h-4 w-28 rounded-sm' />
          ) : (
            <>
              <DateTime dateString={date} />
              {uri && fuenteNoticia !== '-' && title && (
                <VisitCounter
                  slug={uri}
                  dateString={date}
                  featuredImage={featuredImage?.node?.srcSet ?? ''}
                  title={title}
                />
              )}
            </>
          )}
        </div>
        <div className='hidden pt-2 whitespace-nowrap md:block md:pt-0'>
          <Share uri={uri ?? ''} />
        </div>
      </div>
    </>
  )
}

export { PostHeader }
