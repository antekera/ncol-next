// Posts
export interface Categories {
  name: string[]
  uri: string[]
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

export interface Author {
  name: string
  firstName: string
  lastName: string
  avatar: {
    url: string
  }
}

export interface FeaturedImage {
  sourceUrl: string
}

export interface Post {
  title: string
  excerpt?: string
  slug: string
  uri: string
  date: string
  featuredImage?: {
    node: FeaturedImage
  }
  author: {
    node: Author
  }
  categories?: {
    edges: {
      node: Categories
    }[]
  }
  tags: {
    edges: {
      node: Tags
    }[]
  }
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
