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
    srcSet?: string
  }
}

interface CustomFields {
  antetituloNoticia?: string
  fuenteNoticia?: string
  resumenIa?: string
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
  rawSlug?: string
  isLoading?: boolean
  uri?: string
  featuredImage?: FeaturedImage
  tags?: {
    edges: {
      node: Tags
    }[]
  }
  content?: string
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

export interface SinglePost {
  post: Post
}

export interface RelatedPosts {
  posts: PostsQueried
}

export type CoverImageProps = {
  coverImage: string
  title: string
  className?: string
  uri?: string
  priority?: boolean
  lazy?: boolean
  fullHeight?: boolean
  srcSet?: string
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
}

export interface CategoryArticleProps extends Omit<
  Post,
  'slug' | 'pageInfo' | 'categories'
> {
  className?: string
  isLast?: boolean
  isFirst?: boolean
  type?:
    | 'list'
    | 'secondary'
    | 'thumbnail'
    | 'sidebar'
    | 'recent_news'
    | 'most_visited'
  categories?: Categories
  imageSize?: CoverImageProps['size']
}

export interface PostHome extends Pick<
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

export interface LeftHomePageQueried {
  edges: {
    node: PostHome
  }[]
  pageInfo: PageInfo
}

export interface HomePageQueried {
  cover: {
    edges: {
      node: PostHome
    }[]
  }
  left: {
    edges: {
      node: PostHome
    }[]
    pageInfo: PageInfo
  }
  right: {
    edges: {
      node: PostHome
    }[]
    pageInfo: PageInfo
  }
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

export interface Category {
  name: string
  uri?: string
  slug?: string
  postId?: number
  categoryId?: string
  children?: ChildrenCategory
  parentId?: string | null
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
  type: string
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

export interface PostsCategoryQueried extends Omit<
  PostsQueried,
  'tags' | 'content' | 'customFields'
> {
  categories: ChildrenCategory
}

export interface PostsTagQueried extends Omit<
  PostsQueried,
  'tags' | 'content' | 'customFields'
> {
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
  offset?: number
  enabled?: boolean
}

export type PostsFetcherReturn =
  | LeftHomePageQueried
  | PostsQueried
  | PostsCategoryQueried

export type LoaderProps = {
  slug: string
  qty: number
  fetchMorePosts: (offset: number) => Promise<any>
}

export interface Link {
  name: string
  href: string
  type?: 'pill' | 'link'
  badge?: string
  target?: string
  icon?: any
}

// Most Visited Posts
export interface MostVisitedApiResponse {
  posts: {
    slug: string
    title: string
    image: string
  }[]
}

export interface MostVisitedDbRecord {
  post_slug: string
  total_views: number
  title: string
  featured_image: string
  created_at: string
}
