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

export interface FeaturedImage {
  sourceUrl: string
}

export interface PostHeader {
  title: string
  date: string
  categories?: {
    edges: {
      node: Categories
    }[]
  }
}

export interface Post extends PostHeader {
  excerpt?: string
  slug: string
  uri: string
  featuredImage?: {
    node: FeaturedImage
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

/**
 * description
 */

type ContainerProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
  tag?: string
}

type CoverImageProps = {
  coverImage: FeaturedImage
  title: string
  uri?: string
}

type DateProps = {
  dateString: string
}

type HeaderProps = {
  title?: string
  type?: 'main' | 'category' | 'single' | 'share' | 'primary'
  compact?: boolean
  className?: string
  isMobile?: boolean
}
