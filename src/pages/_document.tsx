import React, { ReactElement } from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import {
  CMS_URL,
  CMS_NAME,
  PAGE_TITLE,
  PAGE_DESCRIPTION,
} from '../lib/constants'

class AppDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang='es'>
        <Head>
          {/* Meta */}
          <meta name='HandheldFriendly' content='True' />
          <meta name='MobileOptimized' content='320' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          />
          <meta property='fb:pages' content='179625918819228' />
          <meta name='msapplication-TileColor' content='#ffffff' />
          <meta
            name='msapplication-TileImage'
            content='/favicon/ms-icon-144x144.png'
          />
          <meta name='theme-color' content='#ffffff' />
          <meta
            name='msapplication-config'
            content='/favicon/browserconfig.xml'
          />
          <meta name='description' content={PAGE_DESCRIPTION} />

          {/* Meta Facebook */}
          <meta property='og:title' content={PAGE_TITLE} />
          <meta property='og:description' content={PAGE_DESCRIPTION} />
          <meta property='og:url' content={CMS_URL} />
          <meta property='og:type' content='website' />
          <meta property='og:image' content={'media/iconfb.png'} />

          {/* Open Graph */}
          <meta property='og:url' content={CMS_URL} key='ogurl' />
          <meta property='og:image' content='media/iconfb.png' key='ogimage' />
          <meta property='og:site_name' content={CMS_NAME} key='ogsitename' />
          <meta property='og:title' content={PAGE_TITLE} key='ogtitle' />
          <meta
            property='og:description'
            content={PAGE_DESCRIPTION}
            key='ogdesc'
          />

          {/* Favicons */}
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
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AppDocument
