import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

const Post: NextPage = () => {
  const router = useRouter()
  const { pid } = router.query

  return (
    <div className='overflow-x-hidden bg-gray-100'>
      <Head>
        <title>Post</title>
      </Head>
      <div>
        <h1>Post</h1>
        <div>
          <p>Post: {pid}</p>
        </div>
      </div>
    </div>
  )
}

export default Post
