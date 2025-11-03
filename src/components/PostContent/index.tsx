import { ReactNode, useEffect, useRef } from 'react'
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
import Link from 'next/link'
import { GA_EVENTS, TAG_PATH } from '@lib/constants'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { GAEvent } from '@lib/utils'
import ContextStateData from '@lib/context/StateContext'

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
  secondParagraph,
  sidebarContent,
  tags,
  title,
  uri,
  slug,
  rawSlug
}: Props) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })
  const isMobile = useIsMobile()
  const hasTags = tags && tags.edges && tags.edges.length > 0
  const refContent = useRef<HTMLDivElement>(null)
  const { handleSetContext } = ContextStateData()

  useEffect(() => {
    const el = refContent.current
    const top = el ? el.getBoundingClientRect().top + window.scrollY : 0
    handleSetContext({
      contentHeight: el?.clientHeight || 0,
      contentOffsetTop: top
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={refContent}>
      <Container className='py-4' sidebar>
        {title && (
          <div className='pb-3'>
            <PostHeader
              title={title}
              date={date}
              categories={categories}
              uri={uri}
              rawSlug={rawSlug}
              featuredImage={featuredImage}
              {...customFields}
            />
          </div>
        )}
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          {featuredImage && (
            <div className='relative mb-4 w-full lg:max-h-[500px]'>
              <CoverImage
                className='relative mb-4 block w-full overflow-hidden rounded-sm lg:max-h-[500px]'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
                fullHeight
                srcSet={featuredImage?.node?.srcSet}
                size={isMobile ? 'md' : 'lg'}
              />
            </div>
          )}
          <div className='border-b border-solid border-slate-200 dark:border-neutral-500 pb-4 text-slate-500 md:hidden dark:text-neutral-300'>
            <Share uri={uri} />
          </div>
          {firstParagraph && secondParagraph && (
            <PostBody
              firstParagraph={firstParagraph}
              secondParagraph={secondParagraph}
            />
          )}
          {customFields?.fuenteNoticia &&
            customFields.fuenteNoticia !== '-' && (
              <div className='200 mx-auto block w-full max-w-2xl items-center gap-1 pb-8 font-sans text-sm md:pr-8 lg:pl-0 xl:w-3/4'>
                <span className='dark:bg-primary mr-2 inline-block h-2 w-2 rounded-sm bg-slate-700'></span>
                <span>Con información de </span>
                <span>{customFields.fuenteNoticia}</span>
                {hasTags && (
                  <div className='flex flex-wrap items-center gap-1 pt-6'>
                    <span className='hidden sm:inline-block'>Etiquetas: </span>
                    {tags.edges.map(({ node }) => {
                      return (
                        <Link
                          key={node.id}
                          className='inline-block rounded-full bg-gray-100 px-3 py-1 font-sans text-xs text-nowrap text-gray-700 uppercase hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 hover:dark:bg-neutral-500'
                          href={`${TAG_PATH}/${node.slug}`}
                          onClick={() =>
                            GAEvent({
                              category: GA_EVENTS.POST_LINK.TAG.CATEGORY,
                              label: `${isMobile ? 'MOBILE' : 'DESKTOP'}_POST_TAG`
                            })
                          }
                        >
                          #{node.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          {isMobile && (
            <MostVisitedPosts isLayoutMobile className='sidebar-most-visited' />
          )}
          <SocialLinks
            showBackground
            showText
            vertical={isMobile}
            className='mb-6'
          />
          <div ref={ref}>
            {isMobile ? (
              <RelatedPostsSlider slug={slug} inView={inView} />
            ) : (
              <RelatedPosts slug={slug} inView={inView} />
            )}
          </div>
          <Newsletter className='mb-4 w-full md:mx-4 md:hidden' />
          <FbComments uri={uri} />
          {children}
        </section>
        <Sidebar offsetTop={80}>{sidebarContent}</Sidebar>
      </Container>
    </div>
  )
}
