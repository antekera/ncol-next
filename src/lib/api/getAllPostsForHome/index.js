import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(query, {
    variables: {
      onlyEnabled: !preview,
      preview,
    },
  })

  return data?.posts
}
