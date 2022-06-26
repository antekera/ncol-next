import { LinkIcon, MailIcon } from '@heroicons/react/outline'

import { Icon } from 'components/'
import { icons } from 'components/Icon'
const defaultProps = {}

const Share = () => {
  return (
    <>
      Compártelo
      <a
        href='#!'
        className={`inline-block w-4 h-4 ml-4 ease-in-out duration-200 hover:text-[${icons.facebook.color}]`}
      >
        <Icon network='facebook' width='w-5' />
      </a>
      <a
        href='#!'
        className={`inline-block w-5 h-4 ml-3 ease-in-out duration-200 hover:text-[${icons.twitter.color}]`}
      >
        <Icon network='twitter' width='w-5' />
      </a>
      <a
        href='#!'
        className={`inline-block w-5 h-4 ml-4 ease-in-out duration-200 hover:text-[${icons.whatsapp.color}]`}
      >
        <Icon network='whatsapp' width='w-5' size />
      </a>
      <a
        href='#!'
        className='inline-block w-5 h-4 ml-4 ease-in-out duration-200 hover:text-primary'
      >
        <MailIcon />
      </a>
      <a
        href='#!'
        className='inline-block w-5 h-4 ml-4 ease-in-out duration-200 hover:text-primary'
      >
        <LinkIcon />
      </a>
    </>
  )
}

Share.defaultProps = defaultProps

export { Share }
