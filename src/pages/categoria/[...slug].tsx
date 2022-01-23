// import { useRouter } from 'next/router'

import Container from '../../components/Container'
import Header from '../../components/header'
import Image from 'next/image'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { getPostsByCategory, getAllCategoriesWithSlug } from '../../lib/api'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'

import { PostPage, PostsQueried } from '../../lib/types'

const Page: NextPage<PostPage> = ({ posts }) => {
  // const router = useRouter()

  const allPosts = posts?.edges

  return (
    <Layout>
      <Container>
        <Header />

        {allPosts &&
          allPosts.map(({ node }) => (
            <div key={node.title}>
              <Image
                width={100}
                height={100}
                alt={node.title}
                src={'node ? node.featuredImage?.node.sourceUrl : null'}
              />
              <h1 className='py-5'>{node.title}</h1>
              <h2>
                {/* {node.categories.edges.map((node, i) => (
                  <Link key={i} href={`${node.node.uri}`}>
                    <a aria-label={node.node.name}>{node.node.name}</a>
                  </Link>
                ))} */}
              </h2>
              <Link href={`${node.uri}`}>
                <a aria-label={node.title}>Ver más</a>
              </Link>
            </div>
          ))}
      </Container>
    </Layout>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async ({ params = {} }) => {
  // const { slug } = params
  const last = 'slug.pop()'
  const data = await getPostsByCategory(last)

  return {
    props: {
      posts: data,
    },
    revalidate: 84600,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allCategories: PostsQueried = await getAllCategoriesWithSlug()

  return {
    paths: allCategories.edges.map(({ node }) => `/categoria${node.uri}`) || [],
    fallback: true,
  }
}
