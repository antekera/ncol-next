import React from 'react'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { SQUARE_C1 } from '@lib/constants'

import styles from './style.module.css'

type PostBodyProps = {
  content: string
}

const PostBody = ({ content }: PostBodyProps) => {
  const regex = /<p>(.*?)<\/p>/
  const p = '</p>'
  const [first] = content.split(p)
  const firstParagraphContent = `${first}${p}`
  const restParagraphContent = content.replace(regex, '')

  return (
    <>
      <div
        className={`${styles.capital} ${styles.content} max-w-2xl mx-auto capital-letter`}
        dangerouslySetInnerHTML={{ __html: firstParagraphContent }}
      />
      <AdDfpSlot
        id={SQUARE_C1.ID}
        style={SQUARE_C1.STYLE}
        className='pt-2 mb-2'
      />
      <div
        className={`${styles.content} max-w-2xl pb-6 mx-auto`}
        dangerouslySetInnerHTML={{ __html: restParagraphContent }}
      />
    </>
  )
}

export { PostBody }
export type { PostBodyProps }
