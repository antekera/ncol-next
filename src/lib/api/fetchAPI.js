const API_URL = process.env.WORDPRESS_API_URL

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

  const res = await fetch(API_URL, init)

  if (res.status === 200) {
    const { data } = await res.json()
    return data
  } else {
    return { error: true }
  }
}
