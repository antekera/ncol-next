import { gql, useQuery, NetworkStatus } from '@apollo/client'

// query allPosts($first: Int!, $skip: Int!) {
//   allPosts(orderBy: { createdAt: desc }, first: $first, skip: $skip) {
//     id
//     title
//     votes
//     url
//     createdAt
//   }
//   _allPostsMeta {
//     count
//   }
// }

export const ALL_POSTS_QUERY = gql`
  query AllPosts {
    posts(first: 70, where: { orderby: { field: DATE, order: DESC } }) {
      edges {
        node {
          title
          excerpt
          slug
          date
          featuredImage {
            node {
              sourceUrl
            }
          }
          author {
            node {
              name
              firstName
              lastName
              avatar {
                url
              }
            }
          }
        }
      }
    }
  }
`

export const allPostsQueryVars = {
  skip: 0,
  first: 10,
}

export default function PostList() {
  const { loading, error, data, networkStatus } = useQuery(ALL_POSTS_QUERY, {
    variables: allPostsQueryVars,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  })

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore

  // const loadMorePosts = () => {
  //   fetchMore({
  //     variables: {
  //       skip: AllPosts.length,
  //     },
  //   })
  // }

  if (error) return <div>Error loading posts.</div>
  if (loading && !loadingMorePosts) return <div>Loading</div>

  // const { AllPosts, _allPostsMeta } = data
  // const { AllPosts } = data.posts.edges
  // const areMorePosts = AllPosts.length < _allPostsMeta.count

  return (
    <section>
      <ul>
        {data.posts.edges.map((post, index) => (
          // const { node } = post
          <li key={index}>
            {/* {JSON.stringify(post)} */}
            <div>
              <span>{index + 1}. </span>
              <a href={post.node.title}>{post.node.title}</a>
            </div>
          </li>
        ))}
      </ul>
      {/* {areMorePosts && (
        <button onClick={() => loadMorePosts()} disabled={loadingMorePosts}>
          {loadingMorePosts ? 'Loading...' : 'Show More'}
        </button>
      )} */}
      <style jsx>{`
        section {
          padding-bottom: 20px;
        }
        li {
          display: block;
          margin-bottom: 10px;
        }
        div {
          align-items: center;
          display: flex;
        }
        a {
          font-size: 14px;
          margin-right: 10px;
          text-decoration: none;
          padding-bottom: 0;
          border: 0;
        }
        span {
          font-size: 14px;
          margin-right: 5px;
        }
        ul {
          margin: 0;
          padding: 0;
        }
        button:before {
          align-self: center;
          border-style: solid;
          border-width: 6px 4px 0 4px;
          border-color: #ffffff transparent transparent transparent;
          content: '';
          height: 0;
          margin-right: 5px;
          width: 0;
        }
      `}</style>
    </section>
  )
}
