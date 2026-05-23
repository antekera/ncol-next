'use client'

import { useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { PostHome } from '@lib/types'
import { VideoPlayer } from '@components/VideoPlayer'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { getCategoryNode } from '@lib/utils/getCategoryNode'
import { CATEGORY_PATH, GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

type VideoCardProps = {
  node: PostHome
  className?: string
}

export const VideoCard = ({ node, className = '' }: VideoCardProps) => {
  const category = getCategoryNode(node.categories)
  const categoryName = category?.name || 'Video'
  const categorySlug = category?.slug
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) {
        GAEvent({
          action: GA_EVENTS.VIDEO_WIDGET.PLAY_VIDEO,
          category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
          label: node.customFields?.videodestacado || ''
        })
      }
    }

    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  }, [node])

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-white shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-2xl ${className}`}
    >
      {/* Video Container */}
      <div className='relative aspect-video w-full shrink-0 overflow-hidden bg-black'>
        <VideoPlayer
          url={node.customFields?.videodestacado || ''}
          iframeRef={iframeRef}
          className='!mb-0 h-full w-full rounded-none'
        />
      </div>

      {/* Info Container */}
      <div className='flex flex-1 flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 p-4'>
        <div className='space-y-1.5'>
          {categoryName &&
            (categorySlug ? (
              <HoverPrefetchLink
                href={`${CATEGORY_PATH}/${categorySlug}`}
                className='text-secondary font-sans text-[10px] font-bold tracking-wider uppercase transition-colors hover:text-slate-200'
                onClick={() =>
                  GAEvent({
                    action: GA_EVENTS.VIDEO_WIDGET.CLICK_CATEGORY_LINK,
                    category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                    label: categorySlug
                  })
                }
              >
                {categoryName}
              </HoverPrefetchLink>
            ) : (
              <span className='text-secondary font-sans text-[10px] font-bold tracking-wider uppercase'>
                {categoryName}
              </span>
            ))}
          <h4 className='line-clamp-2 text-sm leading-snug font-bold text-slate-100 transition-colors group-hover:text-sky-400 sm:text-base'>
            <HoverPrefetchLink
              href={node.uri}
              onClick={() =>
                GAEvent({
                  action: GA_EVENTS.VIDEO_WIDGET.CLICK_POST_LINK,
                  category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                  label: node.uri
                })
              }
            >
              {node.title}
            </HoverPrefetchLink>
          </h4>
        </div>

        <div className='mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3'>
          <span className='font-sans text-[10px] text-slate-300'>
            {node.date
              ? new Date(node.date).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : ''}
          </span>
          <HoverPrefetchLink
            href={node.uri}
            className='flex items-center gap-1 font-sans text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300'
            onClick={() =>
              GAEvent({
                action: GA_EVENTS.VIDEO_WIDGET.CLICK_VIEW_NEWS,
                category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                label: node.uri
              })
            }
          >
            Ver noticia
            <ArrowRight className='h-3.5 w-3.5' />
          </HoverPrefetchLink>
        </div>
      </div>
    </div>
  )
}
