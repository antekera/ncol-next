import React from 'react'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { PostBodyProps } from 'lib/types'

import styles from './style.module.css'

const PostBody = ({ firstParagraph, secondParagraph, adId }: PostBodyProps) => {
  return (
    <>
      <div
        className={`${styles.capital} ${styles.content} max-w-2xl mx-auto capital-letter post-body`}
        dangerouslySetInnerHTML={{ __html: firstParagraph }}
      />
      {adId && <AdDfpSlot id={adId} className='pt-2 mb-2' />}
      <div
        className={`${styles.content} max-w-2xl pb-6 mx-auto`}
        dangerouslySetInnerHTML={{ __html: secondParagraph }}
      />
    </>
  )
}

export { PostBody }
