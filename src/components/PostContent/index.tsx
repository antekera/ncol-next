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
import Link from 'next/link'
import { GA_EVENTS, TAG_PATH } from '@lib/constants'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { GAEvent } from '@lib/utils'

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

  return (
    <>
      {title && (
        <PostHeader
          title={title}
          date={date}
          categories={categories}
          uri={uri}
          rawSlug={rawSlug}
          featuredImage={featuredImage}
          {...customFields}
        />
      )}
      <Container className='py-4' sidebar>
        <section className='post-content-section'>
          {featuredImage && (
            <div className='post-content-image-wrapper'>
              <CoverImage
                className='post-content-image'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
                fullHeight
                srcSet={featuredImage?.node?.srcSet}
                size={isMobile ? 'md' : 'lg'}
              />
            </div>
          )}
          <div className='post-content-share-mobile'>
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
              <div className='post-content-source'>
                <span className='post-content-source-icon'></span>
                <span>Con información de </span>
                <span>{customFields.fuenteNoticia}</span>
                {hasTags && (
                  <div className='post-content-tags'>
                    <span className='post-content-tags-label'>
                      Etiquetas:{' '}
                    </span>
                    {tags.edges.map(({ node }) => {
                      return (
                        <Link
                          key={node.id}
                          className='post-content-tag'
                          href={`${TAG_PATH}/${node.slug}`}
                          onClick={() =>
                            GAEvent({
                              category: GA_EVENTS.POST_LINK.TAG.CATEGORY,
                              label: `${
                                isMobile ? 'MOBILE' : 'DESKTOP'
                              }_POST_TAG`
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
            <MostVisitedPosts
              isLayoutMobile
              className='sidebar-most-visited'
            />
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
          <Newsletter className='post-content-newsletter' />
          <FbComments uri={uri} />
          {children}
        </section>
        <Sidebar offsetTop={80}>{sidebarContent}</Sidebar>
      </Container>
    </>
  )
}