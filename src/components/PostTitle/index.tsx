type PostTitleProps = {
  children: React.ReactNode
}

const defaultProps = {}

const PostTitle = ({ children }: PostTitleProps) => {
  return (
    <h1
      className='my-6 text-3xl leading-none sm:w-11/12 md:my-12 md:text-5xl font-sans_medium text-darkGray'
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}

PostTitle.defaultProps = defaultProps

export { PostTitle }
export type { PostTitleProps }
