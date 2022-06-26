import styles from './style.module.css'

type PostBodyProps = {
  content: string
}

const defaultProps = {}

const PostBody = ({ content }: PostBodyProps) => {
  return (
    <div className='max-w-2xl mx-auto'>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

PostBody.defaultProps = defaultProps

export { PostBody }
export type { PostBodyProps }
