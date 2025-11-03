import { Container } from '@components/Container'
import { PostHeader } from '@components/PostHeader'
import { Skeleton } from '@components/ui/skeleton'
import { titleFromSlug } from '@lib/utils/titleFromSlug'
import { Sidebar } from '@components/Sidebar'

function Loading({ slug }: { readonly slug: string }) {
  return (
    <Container className='pt-6 pb-16' sidebar>
      <div className='w-full pb-3 md:pr-4'>
        <PostHeader
          title={titleFromSlug(slug)}
          categories={{ edges: [], type: '' }}
          isLoading
          rawSlug=''
        />
      </div>
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        <Skeleton className='h-40 w-full rounded-sm lg:h-72' />
        <div className='mx-auto flex max-w-2xl flex-col space-y-2 pt-8'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-11/12' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </section>
      <Sidebar offsetTop={80} />
    </Container>
  )
}

export { Loading }
