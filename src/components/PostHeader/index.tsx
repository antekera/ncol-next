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
  featuredImage
}: PostHeaderProps) => {
  return (
    <Container>
      {isLoading ? (
        <div className='post-header-loading-category'></div>
      ) : (
        <PostCategories
          slice={4}
          className='post-header-categories'
          {...categories}
        />
      )}
      {isLoading ? (
        <div className='post-header-loading-title'>
          <Skeleton className='h-10 w-5/6 rounded-sm' />
          <Skeleton className='h-10 w-4/5 rounded-sm' />
        </div>
      ) : (
        <h1 className='post-header-title'>{title}</h1>
      )}
      {antetituloNoticia && (
        <p className='post-header-subtitle'>{antetituloNoticia}</p>
      )}
      <div className='post-header-meta'>
        <div className='post-header-meta-left'>
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
        <div className='post-header-meta-right'>
          <Share uri={uri ?? ''} />
        </div>
      </div>
    </Container>
  )
}

export { PostHeader }