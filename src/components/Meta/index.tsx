import {
  CMS_NAME,
  CMS_URL,
  HOME_PAGE_TITLE,
  PAGE_DESCRIPTION,
  TWITTER_USERNAME
} from '@lib/constants'

interface MetaProps {
  description: string
  title: string
  image: string
  url: string
}

const Meta = ({
  title = `${HOME_PAGE_TITLE}`,
  description = `${PAGE_DESCRIPTION}`,
  image = '/media/tw.png',
  url = `${CMS_URL}`
}: Partial<MetaProps>) => {
  return (
    <>
      {/* Meta */}
      <meta name='HandheldFriendly' content='True' />
      <meta name='MobileOptimized' content='320' />
      <meta itemProp='name' content={title} />
      <meta itemProp='description' content={description} />
      <meta itemProp='image' content={image} />
      {/* Facebook */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:image' content={image} />
      <meta property='fb:pages' content='179625918819228' />
      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image} />
      <meta property='og:site_name' content={CMS_NAME} key='ogsitename' />
      <meta property='og:description' content={description} key='ogdesc' />
      {/* Twitter */}
      <meta name='twitter:card' content={image} />
      <meta name='twitter:site' content={TWITTER_USERNAME} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:creator' content={TWITTER_USERNAME} />
      <meta property='og:url' content={url} />
      <meta name='twitter:image' content={image} />
    </>
  )
}

export { Meta }
