import { AdDfpSlot } from '@components/AdDfpSlot'
import { PostBodyProps } from 'lib/types'

import styles from './style.module.css'

const PostBody = ({ firstParagraph, secondParagraph, adId }: PostBodyProps) => {
  return (
    <>
      <div
        className={`${styles.capital} ${styles.content} capital-letter post-body mx-auto max-w-2xl`}
        dangerouslySetInnerHTML={{ __html: firstParagraph }}
      />
      {adId && <AdDfpSlot id={adId} className='mb-2 pt-2' />}
      <div
        className={`${styles.content} mx-auto max-w-2xl pb-6`}
        dangerouslySetInnerHTML={{ __html: secondParagraph }}
      />
    </>
  )
}

export { PostBody }
