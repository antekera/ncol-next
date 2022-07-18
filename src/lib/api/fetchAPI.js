const API_URL = process.env.WORDPRESS_API_URL

export async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  })

  let json = { status: res.status, text: res.statusText }

  if (res.status === 200) {
    json = await res.json()
  }

  if (res.status === 500) {
    console.error(json.errors, ...json)
    throw new Error('Failed to fetch API')
  }

  return json.data
}
