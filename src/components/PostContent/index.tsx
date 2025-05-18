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
import type { Post } from '@lib/types'
import { SocialLinks } from '@components/SocialLinks'
import { useInView } from 'react-intersection-observer'

type Props = Omit<Post, 'pageInfo'> & {
  children?: ReactNode
  firstParagraph: string
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
  secondParagraph,
  sidebarContent,
  tags,
  title,
  uri,
  slug
}: Props) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  if (isLoading) {
    return (
      <div className='mb-6 flex w-full items-center justify-center rounded bg-slate-200 p-4 text-center dark:bg-neutral-800'>
        Loading...
      </div>
    )
  }

  return (
    <>
      {title && (
        <PostHeader
          title={title}
          date={date}
          categories={categories}
          tags={tags}
          uri={uri}
          {...customFields}
        />
      )}
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
            <Share uri={uri} />
          </div>
          {firstParagraph && secondParagraph && (
            <PostBody
              firstParagraph={firstParagraph}
              secondParagraph={secondParagraph}
            />
          )}
          <SocialLinks
            showBackground
            showText
            className='mb-6 hidden xl:flex'
          />
          <SocialLinks
            showBackground
            showText
            vertical
            className='mb-6 xl:hidden'
          />
          <Newsletter className='mb-4 w-full md:mx-4 md:hidden' />
          <div ref={ref}>
            <div className='show-mobile'>
              <RelatedPostsSlider slug={slug} inView={inView} />
            </div>
            <div className='show-desktop'>
              <RelatedPosts slug={slug} inView={inView} />
            </div>
          </div>
          <FbComments uri={uri} />
          {children}
        </section>
        <Sidebar offsetTop={80}>{sidebarContent}</Sidebar>
      </Container>
    </>
  )
}
