import { ReactNode } from 'react'
import { Container } from '@components/Container'
import { CoverImage } from '@components/CoverImage'
import { FbComments } from '@components/FbComments'
import { Newsletter } from '@components/Newsletter'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import { RelatedPosts } from '@components/RelatedPosts'
import { RelatedPostsSlider } from '@components/RelatedPostsSlider'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import type { Post, PostPage } from '@lib/types'

type Props = Omit<Post, 'slug' | 'uri' | 'pageInfo'> & {
  children?: ReactNode
  firstParagraph: string
  relatedPosts: PostPage['relatedPostsSlider']
  secondParagraph: string
  sidebarContent?: ReactNode
}

export const PostContent = ({
  categories,
  children,
  customFields,
  date,
  featuredImage,
  firstParagraph,
  isLoading,
  relatedPosts,
  secondParagraph,
  sidebarContent,
  tags,
  title
}: Props) => {
  if (isLoading) {
    return (
      <div className='mb-6 flex w-full items-center justify-center rounded bg-slate-200 p-4 text-center dark:bg-neutral-800'>
        Loading...
      </div>
    )
  }

  return (
    <>
      <PostHeader
        title={title}
        date={date}
        categories={categories}
        tags={tags}
        {...customFields}
      />
      <Container className='py-4' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          {featuredImage && (
            <div className='relative mb-4 w-full lg:max-h-[500px]'>
              <CoverImage
                className='relative mb-4 block w-full overflow-hidden rounded-sm lg:max-h-[500px]'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
                fullHeight
              />
            </div>
          )}
          <div className='border-b border-solid border-slate-300 pb-4 text-slate-500 md:hidden dark:text-neutral-300'>
            <Share />
          </div>
          {firstParagraph && secondParagraph && (
            <PostBody
              firstParagraph={firstParagraph}
              secondParagraph={secondParagraph}
            />
          )}
          <Newsletter className='mx-4 mb-4 md:hidden' />
          <div className='show-mobile'>
            <RelatedPostsSlider posts={relatedPosts} />
          </div>
          <div className='show-desktop'>
            <RelatedPosts posts={relatedPosts} />
          </div>
          <FbComments />
          {children}
        </section>
        <Sidebar offsetTop={80}>{sidebarContent}</Sidebar>
      </Container>
    </>
  )
}
