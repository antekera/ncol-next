// Ads
interface Ad {
  id: string
  style: { minWidth: string; minHeight: string }
}

interface Ads {
  ads: Record<string, Ad>
}

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

export interface CategoryArticleProps extends Post {
  className?: string
  isLast?: boolean
  isFirst?: boolean
  type?: 'list' | 'secondary' | 'thumbnail' | 'sidebar' | 'recent_news'
}

export interface PostHome
  extends Omit<
    Post,
    | 'tags'
    | 'content'
    | 'customFields'
    | 'contentType'
    | 'isPreview'
    | 'isRestricted'
    | 'isRevision'
    | 'status'
    | 'template'
  > {
  categories: Categories
}
export interface HomePage extends Ads {
  mainPost: PostHome
  leftPosts_1: {
    node: PostHome
  }[]
  leftPosts_2: {
    node: PostHome
  }[]
  leftPosts_3: {
    node: PostHome
  }[]
  leftPosts_4: {
    node: PostHome
  }[]
  rightPosts_1: {
    node: PostHome
  }[]
  rightPosts_2: {
    node: PostHome
  }[]
  rightPosts_3: {
    node: PostHome
  }[]
  rightPosts_4: {
    node: PostHome
  }[]
  posts: {
    node: PostHome
  }[]
  allowRevalidate?: boolean
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
}

export interface PostPage extends Ads {
  post: Post
  content: string[]
  posts: PostsQueried
  preview?: boolean
  relatedPostsByCategory: PostsCategoryQueried['edges']
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

export interface CategoryPage extends Ads {
  posts: PostsCategoryQueried
  title: string
  childrenCategories: Categories
  allowRevalidate?: boolean
}

export type MetadataProps = {
  params: { slug: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}
