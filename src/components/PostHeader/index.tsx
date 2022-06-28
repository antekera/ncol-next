import { DateTime, Container, Share, PostCategories } from 'components'
import { PostHeader as PostHeaderProps } from 'lib/types'

const PostHeader = ({
  title,
  date,
  categories,
  antetituloNoticia,
  fuenteNoticia,
}: PostHeaderProps) => {
  return (
    <Container>
      <PostCategories {...categories} />
      <h1 className='mt-10 mb-8 text-2xl leading-tight sm:text-3xl sm:w-11/12 md:mt-12 md:mb-10 md:text-5xl lg:text-5xl font-sans_medium text-slate-700'>
        {title}
      </h1>
      {antetituloNoticia && (
        <p className='mb-6 -mt-6 md:text-xl lg:text-2xl md:-mt-6 md:mb-7 text-slate-500 leading-6 sm:w-11/12 font-sans_light'>
          {antetituloNoticia}
        </p>
      )}
      <div className='w-full pt-4 pb-2 text-sm border-t md:flex md:justify-between text-slate-500 font-sans_light border-slate-200'>
        <div className='pr-2'>
          <DateTime dateString={date} />
          {fuenteNoticia && (
            <div className='inline'>
              <span className='pl-2 pr-3'>|</span>
              <span>Con información de </span>
              {fuenteNoticia}
            </div>
          )}
        </div>
        <div className='hidden pt-2 md:block md:pt-0'>
          <Share />
        </div>
      </div>
    </Container>
  )
}

export { PostHeader }
export type { PostHeaderProps }
