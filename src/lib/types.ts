// Posts
export interface PostPath {
  edges: {
    node: {
      uri: string
    }
  }[]
}

interface Tags {
  name: string
  slug: string
  id: string
}

interface FeaturedImage {
  node: {
    sourceUrl: string
  }
}

interface CustomFields {
  antetituloNoticia?: string
  fuenteNoticia?: string
}

interface ContentType {
  cursor: string
  node: {
    id: string
  }
}

export interface PostHeader extends CustomFields {
  title: string
  date?: string
  categories: Categories
  isLoading?: boolean
  tags?: {
    edges: {
      node: Tags
    }[]
  }
}

export interface Post extends PostHeader {
  excerpt?: string
  id?: string
  postId?: number
  slug: string
  uri: string
  featuredImage?: FeaturedImage
  tags?: {
    edges: {
      node: Tags
    }[]
  }
  customFields?: CustomFields
  content?: string
  contentType?: ContentType
  isPreview?: boolean
  isRestricted?: boolean
  isRevision?: boolean
  status?: string
  template?: {
    templateName: string
  }
  pageInfo: PageInfo
}

export interface PostQueried {
  node: Post
}

export interface PostsQueried {
  edges: PostQueried[]
  pageInfo: PageInfo
}

export interface PostsMorePosts {
  post: Post
  posts?: PostsQueried
}

export interface CategoryArticleProps extends Omit<Post, 'slug' | 'pageInfo'> {
  className?: string
  isLast?: boolean
  isFirst?: boolean
  type?: 'list' | 'secondary' | 'thumbnail' | 'sidebar' | 'recent_news'
}

export interface PostHome
  extends Pick<
    Post,
    | 'date'
    | 'excerpt'
    | 'featuredImage'
    | 'title'
    | 'uri'
    | 'id'
    | 'slug'
    | 'pageInfo'
    | 'tags'
    | 'customFields'
    | 'content'
  > {
  categories: Categories
}

export interface PostHomeCol {
  posts: {
    node: PostHome
  }[]
}

export interface NotFoundPage {
  posts: {
    node: Post
  }[]
}

export interface HomePageQueried {
  edges: {
    node: PostHome
  }[]
  pageInfo: PageInfo
}

export interface PostPage {
  post: Post
  content: string[]
  posts: PostsQueried
  preview?: boolean
  relatedPostsSlider?: PostsQueried['edges']
  allowRevalidate?: boolean
}

export interface PostBodyProps {
  firstParagraph: string
  secondParagraph: string
}

// Categories
interface ChildCategory {
  name: string
  slug: string
}

interface ChildrenCategory {
  edges: {
    node: ChildCategory
  }[]
}

interface Category {
  name: string
  uri?: string
  slug?: string
  postId?: number
  categoryId?: string
  children?: ChildrenCategory
}

interface PageInfo {
  endCursor: string
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
}

export interface Categories {
  className?: string
  slice?: number
  edges: {
    node: Category
  }[]
}

export interface CategoriesPath {
  edges: {
    node: {
      slug: string
    }
  }[]
}

export interface TagsPath {
  edges: {
    node: {
      slug: string
    }
  }[]
}

export interface PostsCategoryQueried
  extends Omit<PostsQueried, 'tags' | 'content' | 'customFields'> {
  categories: ChildrenCategory
}

export interface PostsTagQueried
  extends Omit<PostsQueried, 'tags' | 'content' | 'customFields'> {
  categories: ChildrenCategory
}

export interface CategoryPage {
  posts: PostsCategoryQueried
  title: string
  childrenCategories: Categories
  allowRevalidate?: boolean
}

export type MetadataProps = {
  params: { slug: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Post Loader
export type PostsFetcherProps = {
  slug: string
  qty: number
  cursor?: string
}

export type PostsFetcherReturn =
  | HomePageQueried
  | PostsQueried
  | PostsCategoryQueried

export type LoaderProps = PostsFetcherProps & {
  onFetchMoreAction: (props: PostsFetcherProps) => Promise<PostsFetcherReturn>
}
