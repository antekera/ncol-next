import { cn } from '@lib/shared'

const LIST = 'list'
const SECONDARY = 'secondary'
const THUMBNAIL = 'thumbnail'
const SIDEBAR = 'sidebar'
const RECENT_NEWS = 'recent_news'
const MOST_VISITED = 'most_visited'

type CategoryArticleClassesProps = {
  type: string
  isFirst?: boolean
  isLast?: boolean
}

const typeIs = (type: string, typeName: string): boolean => type === typeName

export const getCategoryArticleClasses = ({
  type,
  isFirst,
  isLast
}: CategoryArticleClassesProps) =>
  cn(
    {
      'flex w-full flex-row border-b border-slate-200 py-6 dark:border-neutral-500':
        typeIs(type, LIST)
    },
    {
      'flex flex-col flex-col-reverse':
        typeIs(type, SECONDARY) ||
        typeIs(type, SIDEBAR) ||
        typeIs(type, RECENT_NEWS)
    },
    {
      'mb-6 flex w-full flex-row flex-row-reverse md:flex-col md:flex-col-reverse':
        typeIs(type, THUMBNAIL)
    },
    {
      'flex w-full flex-row flex-row-reverse': typeIs(type, MOST_VISITED)
    },
    { 'border-b-0': isLast },
    { 'pt-0': isFirst },
    'relative'
  )

export const getImageClasses = ({ type }: { type: string }) =>
  cn(
    {
      'mt-8 ml-3 h-16 w-20 sm:mt-0 sm:ml-5 sm:h-28 sm:w-40 lg:h-32 lg:w-48':
        typeIs(type, LIST)
    },
    {
      'h-32 w-full border-b border-b-2 border-slate-200 sm:h-40 md:border-none':
        typeIs(type, SECONDARY)
    },
    {
      'h-32 w-full border-b border-b-2 border-slate-200 md:border-none': typeIs(
        type,
        SIDEBAR
      )
    },
    {
      'h-20 w-full border-b border-b-2 border-slate-200 md:border-none': typeIs(
        type,
        RECENT_NEWS
      )
    },
    {
      'ml-3 h-28 w-1/3 md:mb-2 md:ml-0 md:w-full': typeIs(type, THUMBNAIL)
    },
    {
      'h-20 w-1/4': typeIs(type, MOST_VISITED)
    },
    'image-wrapper relative z-0'
  )

export const getTitleClasses = ({ type }: { type: string }) =>
  cn(
    {
      'mb-3 font-sans text-lg leading-7 font-bold sm:text-xl': typeIs(
        type,
        LIST
      )
    },
    {
      'text-basemt-2 mb-3 font-sans leading-6 font-bold sm:leading-7 md:mb-2 md:text-lg':
        typeIs(type, SECONDARY)
    },
    {
      'mt-2 mb-3 font-sans text-sm leading-5 font-medium md:mb-2': typeIs(
        type,
        SIDEBAR
      )
    },
    {
      'mt-2 mb-3 font-sans text-sm leading-5 font-medium md:mb-2': typeIs(
        type,
        RECENT_NEWS
      )
    },
    {
      'ml-3 font-sans text-base leading-6 md:text-base lg:leading-6': typeIs(
        type,
        THUMBNAIL
      )
    },
    {
      'ml-3 font-sans text-base leading-6': typeIs(type, MOST_VISITED)
    },
    'title hover:text-primary block text-slate-700 dark:text-neutral-300 dark:hover:text-neutral-100'
  )

export const getTitleWrapperClasses = ({ type }: { type: string }) =>
  cn(
    {
      'z-10 mx-2 -mt-5 bg-white pt-1 pr-2 pb-2 pl-3 md:mx-0 md:mt-0 md:pb-1 md:pl-2 dark:bg-neutral-900':
        typeIs(type, SECONDARY) ||
        typeIs(type, SIDEBAR) ||
        typeIs(type, RECENT_NEWS)
    },
    'title-wrapper relative z-10'
  )

export const getContentWrapperClasses = ({ type }: { type: string }) =>
  cn(
    {
      'w-2/3 md:w-full': typeIs(type, THUMBNAIL)
    },
    {
      'w-2/3 md:w-full': typeIs(type, MOST_VISITED)
    },
    'content-wrapper relative z-10 flex-1 font-sans'
  )

export const getCoverImageClasses = ({ type }: { type: string }) =>
  cn(
    {
      'h-16 w-20 w-full sm:h-28 sm:w-40 lg:h-32 lg:w-48': typeIs(type, LIST)
    },
    {
      'h-40 w-full': typeIs(type, SECONDARY)
    },
    {
      'h-32 w-full overflow-hidden rounded-sm': typeIs(type, SIDEBAR)
    },
    {
      'h-20 w-full overflow-hidden rounded-sm': typeIs(type, RECENT_NEWS)
    },
    {
      'h-28 w-full': typeIs(type, THUMBNAIL)
    },
    {
      'h-20 w-full': typeIs(type, MOST_VISITED)
    },
    'relative block'
  )
