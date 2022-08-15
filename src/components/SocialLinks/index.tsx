import { SOCIAL_LINKS } from '@lib/constants'

import { Icon } from '..'

type SocialLinksProps = {
  id: string
  link: string
}

const SocialLinks = () => {
  return (
    <>
      {SOCIAL_LINKS.map(({ id, link }: SocialLinksProps) => (
        <a
          key={id}
          target='_blank'
          href={link}
          className='mr-6 hover:text-white link-social'
          rel='noreferrer noopener'
        >
          <Icon network={id} width='w-4' />
        </a>
      ))}
    </>
  )
}

export { SocialLinks }
