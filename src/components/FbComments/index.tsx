import { Comments, CommentsCount } from 'react-facebook'

import { CMS_URL } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

interface FbCommentsProps {
  url: string
}

const FbComments = ({ url }: FbCommentsProps) => {
  const href = `${CMS_URL}${url}`
  const onClickHandler = () => {
    GAEvent({
      category: 'COMMENTS',
      label: 'SHOW_COMMENTS'
    })
  }

  return (
    <div className='mt-8 mb-6 md:mb-0' id='comentarios'>
      <div className='flex px-4 pt-2 pb-1 text-white border-b rounded bg-slate-300'>
        <button
          className='flex w-full pb-1 text-darkBlue hover:text-primary transition-all ease-in-out duration-200'
          onClick={onClickHandler}
        >
          <h6 className='flex font-sans_medium pt-[3px]'>
            <span className='relative block pr-2 material-symbols-rounded'>
              forum
            </span>
            Comenta esta noticia
          </h6>
          <div className='flex pt-1 leading-none'>
            <span className='block w-6 h-6 pt-1 ml-2 text-sm leading-none border rounded-full circle'>
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
