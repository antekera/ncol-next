import type { Metadata } from 'next'
import {
  CMS_NAME,
  CMS_URL,
  HOME_PAGE_TITLE,
  PAGE_DESCRIPTION,
  TWITTER_USERNAME
} from '@lib/constants'

export const sharedOpenGraph: Metadata = {
  title: HOME_PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: HOME_PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: CMS_URL,
    siteName: CMS_NAME,
    images: [
      {
        url: '/media/fb.png',
        width: 800,
        height: 600,
        alt: CMS_NAME
      }
    ],
    locale: 'es_ES',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_USERNAME,
    title: CMS_NAME,
    description: PAGE_DESCRIPTION,
    creator: TWITTER_USERNAME,
    images: {
      url: '/media/tw.png',
      alt: CMS_NAME
    }
  }
}
