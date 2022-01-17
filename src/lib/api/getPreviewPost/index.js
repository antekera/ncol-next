import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getPreviewPost(id, idType = 'DATABASE_ID') {
  const data = await fetchAPI(query, {
    variables: { id, idType },
  })
  return data.post
}
