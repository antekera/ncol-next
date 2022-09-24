// Ads
export interface Ad {
  id: string
  style: { minWidth: string; minHeight: string }
}

export interface Ads {
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

export interface Tags {
  name: string[]
}

export interface FeaturedImage {
  node: {
    sourceUrl: string
  }
}

export interface CustomFields {
  antetituloNoticia?: string
  fuenteNoticia?: string
}

export interface ContentType {
  node: {
    id: string
  }
}

export interface PostHeader extends CustomFields {
  title: string
  date: string
  categories: Categories
}

export interface Post extends PostHeader {
  excerpt?: string
  id?: string
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
  pageInfo?: PageInfo
}

export interface PostsMorePosts {
  post: Post
  posts?: PostsQueried
}

export interface HomePost extends Ads {
  posts: PostsCategoryQueried
}

export interface HomePostCol extends Ads {
  posts: CategoryArticleProps
}

export interface CategoryArticleProps extends Post {
  className?: string
  isLast: boolean
  isFirst: boolean
  type?: 'list' | 'secondary' | 'thumbnail'
}

// Pages
export type PostHome = Categories &
  Ads &
  Omit<
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
  >

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
}

export interface PostBodyProps extends Ads {
  firstParagraph: string
  secondParagraph: string
}

// Categories
export interface ChildCategory {
  name: string
  slug: string
}

export interface ChildrenCategory {
  edges: {
    node: ChildCategory
  }[]
}

export interface Category {
  name: string
  uri?: string
  slug?: string
  categoryId?: string
  children?: ChildrenCategory
}

export interface PageInfo {
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

export interface PostsCategoryQueried
  extends Omit<PostsQueried, 'tags' | 'content' | 'customFields'> {
  categories: ChildrenCategory
}

export interface CategoryPage extends Ads {
  posts: PostsCategoryQueried
  title: string
  childrenCategories: Categories
}
