'use client'

import { LoaderCircle } from 'lucide-react'
import * as Sentry from '@sentry/browser'
import { Container } from '@components/Container'
import { useCategoryPosts } from '@lib/hooks/data/useCategoryPosts'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useState } from 'react'
import { CoverImage } from '@components/CoverImage'
import { FbComments } from '@components/FbComments'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import { splitPost } from '@lib/utils'
import { GAPageView } from '@lib/utils/ga'
import { useDebounceInView } from '@lib/hooks/useDebounce'
import { PostsQueried } from '@lib/types'
import { Newsletter } from '@components/Newsletter'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { GA_EVENTS } from '@lib/constants'

const POSTS_QTY = 1

export const LoaderSinglePost = ({
  slug,
  title
}: {
  slug: string
  title: string
}) => {
  const [offset, setOffset] = useState(0)
  const [posts, setPosts] = useState<PostsQueried['edges']>([])
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false })
  const debouncedInView = useDebounceInView(inView, 500)
  const lastFetchedOffset = useRef<number | null>(null)
  const isMobile = useIsMobile()

  const { fetchMorePosts, isLoading, error } = useCategoryPosts({
    slug,
    qty: POSTS_QTY,
    offset: 0,
    enabled: false
  })

  const recordPageView = (loaded?: {
    uri?: string
    slug?: string
    title?: string
  }) => {
    if (!loaded) return
    const newUri = loaded.uri || (loaded.slug ? `/posts/${loaded.slug}` : '')
    if (newUri) {
      GAPageView({
        pageType: GA_EVENTS.VIEW.SINGLE_POST,
        pageUrl: newUri,
        pageTitle: loaded.title || GA_EVENTS.VIEW.SINGLE_POST
      })
    }
  }

  const appendEdges = (edges: PostsQueried['edges'], increment: number) => {
    if (!edges?.length) return
    const loadedPost = edges[0]?.node
    recordPageView({
      uri: loadedPost?.uri,
      slug: loadedPost?.slug,
      title: loadedPost?.title
    })
    setOffset(prev => prev + increment)
    setPosts(prev => [...prev, ...edges])
  }

  useEffect(() => {
    if (debouncedInView && !isLoading && !error) {
      const timer = setTimeout(() => {
        void (async () => {
          try {
            if (lastFetchedOffset.current !== offset) {
              const res1 = await fetchMorePosts(offset)
              const edges1 = res1.posts?.edges ?? []

              // If first fetched post equals current page title, fetch the next one
              if (edges1[0]?.node?.title === title) {
                const res2 = await fetchMorePosts(offset + 1)
                lastFetchedOffset.current = offset + 1
                appendEdges(res2.posts?.edges ?? [], POSTS_QTY + 1)
                return
              }

              lastFetchedOffset.current = offset
              appendEdges(edges1, POSTS_QTY)
            }
          } catch (error) {
            Sentry.captureException(error)
          }
        })()
      }, 500)

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInView, isLoading])

  return (
    <>
      {posts?.map(({ node }) => {
        const content = splitPost({ post: node })
        const {
          featuredImage,
          title,
          date,
          categories,
          customFields,
          tags,
          uri,
          slug
        } = node ?? {}
        const [firstParagraph, secondParagraph] = Array.isArray(content)
          ? content
          : []

        return (
          <div key={node.id}>
            {/* <div className='container mx-auto py-4'>
              <div className='show-desktop'>
                <AdSenseBanner
                  className={'min-h-[280px]'}
                  {...ad.global.top_header}
                />
              </div>
              <div className='show-mobile px-4'>
                <AdSenseBanner
                  className={'min-h-[70px]'}
                  {...ad.global.top_header}
                />
              </div>
            </div> */}
            <div
              key={node.id}
              className='mt-8 border-t border-slate-200 pt-8 dark:border-neutral-500'
            >
              <>
                {title && (
                  <PostHeader
                    rawSlug={slug}
                    title={title}
                    date={date}
                    categories={categories}
                    tags={tags}
                    uri={uri}
                    featuredImage={featuredImage}
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
                          srcSet={featuredImage?.node?.srcSet}
                          fullHeight
                          size={isMobile ? 'md' : 'lg'}
                        />
                      </div>
                    )}
                    <div className='border-b border-solid border-slate-200 pb-4 text-slate-500 md:hidden dark:text-neutral-300'>
                      <Share uri={uri} />
                    </div>
                    {firstParagraph && secondParagraph && (
                      <PostBody
                        firstParagraph={firstParagraph}
                        secondParagraph={secondParagraph}
                      />
                    )}
                    <Newsletter className='mb-4 w-full md:mx-4 md:hidden' />
                    <FbComments uri={node.uri} />
                  </section>
                  <Sidebar offsetTop={80} />
                </Container>
              </>
            </div>
          </div>
        )
      })}
      <div className='border-t border-slate-200' ref={ref}>
        <Container
          className={`flex items-center justify-center gap-2 rounded p-6 text-center font-sans`}
        >
          <LoaderCircle className='animate-spin' />
          Cargando el siguiente artículo...
        </Container>
      </div>
    </>
  )
}
