const API_URL = process.env.WORDPRESS_API_URL
const FETCH_ERROR = 'FETCH_ERROR: '

export async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const init = {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  }

  try {
    const response = await fetch(API_URL, init)
    if (!response.ok) {
      const text = await response.text()
      console.log(FETCH_ERROR, { text })
    }
    const { data } = await response.json()
    return data
  } catch (error) {
    console.log(FETCH_ERROR, error)
  }
}
