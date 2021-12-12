import Head from 'next/head'
import { NextPage, GetStaticProps } from 'next'
import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Intro from '../components/intro'
import Layout from '../components/layout'
import { getAllPostsForHome } from '../lib/api'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '../lib/constants'

interface Post {
  node: {
    title: string
    excerpt: string
    slug: string
    date: string
    featuredImage: {
      node: {
        sourceUrl: string
      }
    }
    author: {
      node: {
        name: string
        firstName: string
        lastName: string
        avatar: {
          url: string
        }
      }
    }
  }
}

interface AllPosts {
  edges: Post[]
}
interface IndexPage {
  allPosts: AllPosts
  preview?: boolean
}

const Index: NextPage<IndexPage> = ({ allPosts: { edges }, preview }) => {
  const heroPost = edges[0]?.node
  const morePosts = edges.slice(1)
  console.log(edges)

  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>{PAGE_TITLE}</title>
          <meta name='description' content={PAGE_DESCRIPTION} />
        </Head>
        <Container>
          <Intro />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.featuredImage?.node}
              date={heroPost.date}
              author={heroPost.author?.node}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </Layout>
    </>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview)
  return {
    props: { allPosts, preview },
  }
}
