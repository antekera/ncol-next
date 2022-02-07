import { Date, Container, PostTitle } from 'components/'
import Categories from 'components/categories'

type PostHeaderProps = {
  title: string
  date: string
  categories: string
}

const defaultProps = {}

const PostHeader = ({ title, date, categories }: PostHeaderProps) => {
  return (
    <Container>
      <PostTitle>{title}</PostTitle>
      <div className='max-w-2xl'>
        <div className='mb-6 text-sm md:text-lg'>
          Posted <Date dateString={date} />
          <Categories categories={categories} />
        </div>
      </div>
    </Container>
  )
}

PostHeader.defaultProps = defaultProps

export { PostHeader }
export type { PostHeaderProps }
