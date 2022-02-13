type PostTitleProps = {
  title: String
}

const defaultProps = {}

const PostTitle = ({ title }: PostTitleProps) => {
  return (
    <h1 className='my-6 text-3xl leading-none sm:w-11/12 md:my-12 md:text-5xl font-sans_medium text-slate-700'>
      {title}
    </h1>
  )
}

PostTitle.defaultProps = defaultProps

export { PostTitle }
export type { PostTitleProps }
