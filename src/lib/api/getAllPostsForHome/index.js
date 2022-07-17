import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export const getAllPostsForHome = async preview => {
  const data = await fetchAPI(query, {
    variables: {
      onlyEnabled: !preview,
      preview
    }
  })

  return data?.posts
}
