import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export const getPreviewPost = async (id, idType = 'DATABASE_ID') => {
  const data = await fetchAPI(query, {
    variables: { id, idType }
  })
  return data.post
}
