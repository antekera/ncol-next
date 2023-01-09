import { useState } from 'react'

import { Comments, CommentsCount } from 'react-facebook'

import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

interface FbCommentsProps {
  url: string
}

const FbComments = ({ url }: FbCommentsProps) => {
  const [showComments, setShowComments] = useState(false)
  const href = `${CMS_URL}${url}`

  const onClickHandler = () => {
    setShowComments(!showComments)
    GAEvent({
      category: 'COMMENTS',
      label: 'SHOW_COMMENTS'
    })
  }

  return (
    <div className='mb-6'>
      <div className='flex p-2 px-5 pt-3 pb-2 text-white border-b rounded bg-slate-300'>
        <button
          className='flex w-auto w-full pb-1 text-darkBlue hover:text-primary transition-all ease-in-out duration-200'
          onClick={onClickHandler}
        >
          <h6 className='flex font-sans_medium pt-[3px]'>
            <span className='relative block pr-2 material-symbols-rounded'>
              forum
            </span>
            Ver los comentarios
          </h6>
          <div className='flex pt-1 leading-none'>
            <span className='block w-6 h-6 pt-1 ml-2 text-sm leading-none border rounded-full circle'>
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
