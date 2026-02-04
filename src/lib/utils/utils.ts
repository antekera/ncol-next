export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText} for ${url}`)
  }

  const contentType = res.headers.get('content-type') || ''

  // Check if response is JSON before parsing
  if (!contentType.includes('application/json')) {
    const text = await res.text()

    // Check for XML error responses (common from S3/AWS)
    if (text.startsWith('<?xml') || text.startsWith('<Error')) {
      throw new Error(`Received XML error response instead of JSON from ${url}`)
    }

    throw new Error(`Unexpected content-type "${contentType}" from ${url}`)
  }

  return res.json()
}
