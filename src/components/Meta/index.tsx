import React from 'react'

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

const defaultProps = {
  description: `${PAGE_DESCRIPTION}`,
  title: `${HOME_PAGE_TITLE}`,
  image: '/media/tw.png',
  url: `${CMS_URL}`
}

const Meta = ({ title, description, image, url }: Partial<MetaProps>) => {
  return (
    <>
      {/* Meta */}
      <meta charSet='utf-8' />
      <meta name='HandheldFriendly' content='True' />
      <meta name='MobileOptimized' content='320' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5'
      />
      <meta name='description' content={description} />
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

Meta.defaultProps = defaultProps

export { Meta }
