'use client'

import { MessageCircleMore } from 'lucide-react'
import { Comments, CommentsCount } from 'react-facebook'
import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
import ContextStateData from '@lib/context/StateContext'

const FbComments = ({ uri }: { uri: string }) => {
  const { showComments, handleSetContext } = ContextStateData()
  const href = `${CMS_URL}${uri}`
  const onClickHandler = () => {
    handleSetContext({
      showComments: !showComments
    })
    GAEvent({
      category: 'COMMENTS',
      label: 'SHOW_COMMENTS'
    })
  }

  return (
    <div className='mt-8 mb-6 md:mb-0' id='comentarios'>
      <div className='flex rounded-sm border-b bg-slate-300 px-4 pt-2 pb-1 text-white dark:bg-slate-500'>
        <button
          className='text-dark-blue flex w-full pb-1 transition-all duration-200 ease-in-out'
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
      {showComments && (
        <Comments
          href={href}
          numPosts={5}
          width={'100%'}
          mobile={true}
          lazy={true}
        />
      )}
    </div>
  )
}

export { FbComments }
