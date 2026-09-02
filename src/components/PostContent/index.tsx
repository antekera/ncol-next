import { ReactNode, useEffect, useRef } from 'react'
import { CoverImage } from '@components/CoverImage'
import { getEmbedUrl } from '@lib/utils/video'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import type { Post, PostsQueried } from '@lib/types'
import { useInView } from 'react-intersection-observer'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import ContextStateData from '@lib/context/StateContext'
import { useUserCategories } from '@lib/hooks/useUserCategories'
import dynamic from 'next/dynamic'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { AudioPlayer } from '@components/AudioPlayer'
import { S3_IMAGE_MAX_AGE_DAYS } from '@lib/constants'
import { isPostPublishedWithinDays } from '@lib/utils/isPostPublishedWithinDays'
import type { InlineRelatedPost } from '@lib/types'
import { PostEditorialLinks } from '@components/PostEditorialLinks'
import { TagSubscribeOnboarding } from '@components/TagSubscribeOnboarding'
import { AuthorProfile } from '@components/AuthorProfile'

const VideoPlayer = dynamic(() =>
  import('@components/VideoPlayer').then(mod => mod.VideoPlayer)
)
const Newsletter = dynamic(() =>
  import('@components/Newsletter').then(mod => mod.Newsletter)
)
const RelatedPosts = dynamic(() =>
  import('@components/RelatedPosts').then(mod => mod.RelatedPosts)
)
const RelatedPostsSlider = dynamic(() =>
  import('@components/RelatedPostsSlider').then(mod => mod.RelatedPostsSlider)
)
const MostVisitedPosts = dynamic(() =>
  import('@components/MostVisitedPosts').then(mod => mod.MostVisitedPosts)
)
const SummaryAccordion = dynamic(
  () =>
    import('@components/SummaryAccordion').then(mod => mod.SummaryAccordion),
  { ssr: false }
)
const DollarCalculator = dynamic(() =>
  import('@components/DollarCalculator').then(mod => mod.DollarCalculator)
)
const Reactions = dynamic(() =>
  import('@components/Reactions').then(mod => mod.Reactions)
)

type Props = Omit<Post, 'pageInfo'> & {
  children?: ReactNode
  firstParagraph: string
  secondParagraph: string
  sidebarContent?: ReactNode
  inlineRelatedPost?: InlineRelatedPost | null
  relatedPosts?: PostsQueried['edges']
  authorFoto?: string | null
  hideTitle?: boolean
}

export const PostContent = ({
  author,
  authorFoto,
  categories,
  children,
  customFields,
  date,
  featuredImage,
  firstParagraph,
  secondParagraph,
  tags,
  title,
  uri,
  rawSlug,
  content,
  inlineRelatedPost,
  relatedPosts,
  postId,
  hideTitle
}: Props) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })
  const isMobile = useIsMobile()
  const refContent = useRef<HTMLDivElement>(null)
  const { handleSetContext } = ContextStateData()
  const { trackCategory } = useUserCategories()

  const hasVideo =
    customFields?.videodestacado && getEmbedUrl(customFields.videodestacado)

  const isOpinion = categories?.edges?.some(
    ({ node }) => node.slug === 'opinion'
  )
  const showAuthorCard = isOpinion || !!customFields?.mostrarAutorDeLaNoticia
  const isCdnImage = featuredImage?.node?.sourceUrl?.includes(
    'cdn.noticiascol.com'
  )
  const showFeaturedImage =
    !isOpinion &&
    !!featuredImage?.node?.sourceUrl &&
    (!isCdnImage || isPostPublishedWithinDays(date, S3_IMAGE_MAX_AGE_DAYS))

  useEffect(() => {
    // Track the first relevant category visited
    const firstCategory = categories?.edges?.find(
      ({ node }) => node.slug && !node.slug.startsWith('_')
    )
    if (firstCategory?.node?.slug) {
      trackCategory(firstCategory.node.slug)
    }

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
      {!hideTitle && title && (
        <div className='w-full pb-3'>
          <PostHeader
            title={title}
            date={date}
            categories={categories}
            uri={uri}
            rawSlug={rawSlug}
            featuredImage={featuredImage}
            content={content}
            {...customFields}
          />
        </div>
      )}
      <section className='w-full'>
        {hasVideo ? (
          <VideoPlayer url={customFields.videodestacado!} />
        ) : (
          showFeaturedImage && (
            <div className='relative mb-8 w-full lg:max-h-[500px]'>
              <CoverImage
                className='relative mb-4 block w-full overflow-hidden rounded-sm lg:max-h-[500px]'
                preload
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
                fullHeight
                srcSet={featuredImage?.node?.srcSet}
                size={isMobile ? 'md' : 'lg'}
              />
            </div>
          )
        )}
        {customFields?.resumenIa && (
          <SummaryAccordion summary={customFields.resumenIa} />
        )}
        {postId &&
          content &&
          isPostPublishedWithinDays(date, S3_IMAGE_MAX_AGE_DAYS) && (
            <div className='mx-auto pb-4'>
              <AudioPlayer postId={postId} text={content} />
            </div>
          )}
        {categories?.edges?.some(({ node }) => node.slug === 'dolar-hoy') && (
          <div className='pt-4'>
            <DollarCalculator />
          </div>
        )}
        <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />
        {firstParagraph && secondParagraph && (
          <PostBody
            firstParagraph={firstParagraph}
            secondParagraph={secondParagraph}
            inlineRelatedPost={inlineRelatedPost}
          />
        )}
        <NcolAdSlot
          slot='article-bottom'
          className='my-4 flex justify-center'
        />
        {customFields?.fuenteNoticia && customFields.fuenteNoticia !== '-' && (
          <div className='200 mx-auto block w-full max-w-2xl items-center gap-1 pb-4 font-sans text-sm md:pr-8 lg:pl-0 xl:w-3/4'>
            <span className='dark:bg-primary mr-2 inline-block h-2 w-2 rounded-sm bg-slate-700'></span>
            <span>Con información de </span>
            <span>{customFields.fuenteNoticia}</span>
          </div>
        )}
        {showAuthorCard && author?.node?.name && (
          <AuthorProfile
            name={author.node.name}
            slug={author.node.slug}
            uri={author.node.uri}
            description={author.node.description}
            avatarUrl={authorFoto ?? author.node.avatar?.url}
          />
        )}
        {uri && <Reactions slug={uri} />}
        <PostEditorialLinks categories={categories} tags={tags} />
        {tags?.edges && tags.edges.length > 0 && <TagSubscribeOnboarding />}
        {isMobile && <MostVisitedPosts className='sidebar-most-visited' />}
        <Newsletter className='mb-4 w-full md:mx-4 md:hidden' />
        <div ref={ref}>
          {isMobile ? (
            <RelatedPostsSlider
              slug={rawSlug ?? ''}
              inView={inView}
              categories={categories}
              initialPosts={relatedPosts}
            />
          ) : (
            <RelatedPosts
              slug={rawSlug ?? ''}
              inView={inView}
              categories={categories}
              initialPosts={relatedPosts}
            />
          )}
        </div>

        {children}
      </section>
    </div>
  )
}
