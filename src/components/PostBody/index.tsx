import React from 'react'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { PostBodyProps } from 'lib/types'

import styles from './style.module.css'

const PostBody = ({ content, ads }: PostBodyProps) => {
  const regex = /<*>(.*?)<\/p>/
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
      <AdDfpSlot id={ads.squareC1.id} className='pt-2 mb-2' />
      <div
        className={`${styles.content} max-w-2xl pb-6 mx-auto`}
        dangerouslySetInnerHTML={{ __html: restParagraphContent }}
      />
    </>
  )
}

export { PostBody }
export type { PostBodyProps }
