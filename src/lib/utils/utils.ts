export function fetcher(url: string) {
  return fetch(url, { cache: 'no-store' }).then(res => {
    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
  })
}
