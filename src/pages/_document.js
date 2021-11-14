import Document from 'next/document'
import { Html, Head, Main, NextScript } from 'next/document'
class AppDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta httpEquiv='Cache-control' content='public' />
          <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
          <meta name='keywords' content='Javascript, Next.js' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <body>
          <Main></Main>
          <NextScript></NextScript>
        </body>
      </Html>
    )
  }
}
export default AppDocument
