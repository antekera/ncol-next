// Posts

export interface Category {
  name: string
  uri?: string
  slug?: string
}
export interface Categories {
  edges: {
    node: Category
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

export interface PostHeader extends CustomFields {
  title: string
  date: string
  categories?: Categories
}

export interface Post extends PostHeader {
  excerpt?: string
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
}

export interface PostQueried {
  node: Post
}

export interface PostsQueried {
  edges: PostQueried[]
}

// Pages
export interface IndexPage {
  allPosts: PostsQueried
  preview?: boolean
}

export interface PostPage {
  post: Post
  posts: PostsQueried
  preview?: boolean
}
