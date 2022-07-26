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
      {/* Favicon */}
      <link
        rel='apple-touch-icon'
        sizes='57x57'
        href='/favicon/apple-icon-57x57.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='60x60'
        href='/favicon/apple-icon-60x60.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='72x72'
        href='/favicon/apple-icon-72x72.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='76x76'
        href='/favicon/apple-icon-76x76.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='114x114'
        href='/favicon/apple-icon-114x114.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='120x120'
        href='/favicon/apple-icon-120x120.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='144x144'
        href='/favicon/apple-icon-144x144.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='152x152'
        href='/favicon/apple-icon-152x152.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/favicon/apple-icon-180x180.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='192x192'
        href='/favicon/android-icon-192x192.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='96x96'
        href='/favicon/favicon-96x96.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon/favicon-16x16.png'
      />
      <link
        rel='mask-icon'
        href='/favicon/safari-pinned-tab.svg'
        color='#000000'
      />
      <link
        rel='shortcut icon'
        sizes='192x192'
        href='/favicon/android-icon-192x192.png'
      />
      <link rel='manifest' href='/favicon/manifest.json' />
    </>
  )
}

Meta.defaultProps = defaultProps

export { Meta }
