'use client'

import { MessageCircleMore } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Comments, CommentsCount } from 'react-facebook'

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
    <div className='mb-6 mt-8 md:mb-0' id='comentarios'>
      <div className='flex rounded border-b bg-slate-300 px-4 pb-1 pt-2 text-white'>
        <button
          className='flex w-full pb-1 text-darkBlue transition-all duration-200 ease-in-out hover:text-primary'
          onClick={onClickHandler}
        >
          <h6 className='flex pt-[3px] font-sans_medium'>
            <MessageCircleMore className='mr-2' size={22} />
            Comenta esta noticia
          </h6>
          <div className='flex pt-1 leading-none'>
            <span className='circle ml-2 block h-6 w-6 rounded-full border pt-1 text-sm leading-none'>
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
