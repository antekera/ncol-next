import { Icon } from '@components/Icon'
import { SOCIAL_LINKS } from '@lib/constants'

type SocialLinksProps = {
  id: string
  link: string
  size?: string
}

const SocialLinks = () => {
  return (
    <>
      {SOCIAL_LINKS.map(({ id, link, size }: SocialLinksProps) => (
        <a
          key={id}
          target='_blank'
          href={link}
          className='mr-6 hover:text-white link-social'
          rel='noreferrer noopener'
        >
          <Icon network={id} width='w-4' size={size} />
        </a>
      ))}
    </>
  )
}

export { SocialLinks }
