'use client'

import { MessageCircleMore } from 'lucide-react'
import { Comments, CommentsCount } from 'react-facebook'
import { usePathname } from 'next/navigation'
import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

const FbComments = () => {
  const pathname = usePathname()
  const href = `${CMS_URL}${pathname}`
  const onClickHandler = () => {
    GAEvent({
      category: 'COMMENTS',
      label: 'SHOW_COMMENTS'
    })
  }

  return (
    <div className='mt-8 mb-6 md:mb-0' id='comentarios'>
      <div className='flex rounded-sm border-b bg-slate-300 px-4 pt-2 pb-1 text-white'>
        <button
          className='text-dark-blue hover:text-primary flex w-full pb-1 transition-all duration-200 ease-in-out'
          onClick={onClickHandler}
        >
          <h6 className='flex pt-[3px] font-sans font-medium'>
            <MessageCircleMore className='mr-2' size={22} />
            Comenta esta noticia
          </h6>
          <div className='flex pt-1 leading-none'>
            <span className='circle border-dark-blue ml-2 block h-6 w-6 rounded-full border pt-1 text-sm leading-none'>
              <CommentsCount href={href} />
            </span>
          </div>
        </button>
      </div>
      <Comments
        href={href}
        numPosts={5}
        width={'100%'}
        mobile={true}
        lazy={true}
      />
    </div>
  )
}

export { FbComments }
