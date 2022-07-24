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

export interface Author {
  name: string
  firstName: string
  lastName: string
  avatar: {
    url: string
  }
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
  tags: {
    edges: {
      node: Tags
    }[]
  }
  customFields: CustomFields
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

// Pages
type PostHome = Omit<
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

export interface HomePage {
  mainPost: PostHome
  leftPosts: {
    node: PostHome
  }[]

  rightPosts: {
    node: PostHome
  }[]
}

export interface HomePageQueried {
  edges: {
    node: PostHome
  }[]
}

export interface PostPage {
  post: Post
  posts: PostsQueried
  preview?: boolean
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

export interface CategoryPage {
  posts: PostsCategoryQueried
  title: string
  childrenCategories: Categories
}
