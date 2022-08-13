import React, { ReactElement } from 'react'

import Document, { Html, Main, NextScript, Head } from 'next/document'

import { GaScript } from '@components/index'
class AppDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang='es'>
        <Head>
          <GaScript />
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
            color='#ffffff'
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
        <noscript>
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-KSDFW3'
            height='0'
            width='0'
          ></iframe>
        </noscript>
      </Html>
    )
  }
}

export default AppDocument
