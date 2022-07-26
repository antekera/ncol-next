import React, { ReactElement } from 'react'

import Document, { Html, Main, NextScript } from 'next/document'

class AppDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang='es'>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AppDocument
