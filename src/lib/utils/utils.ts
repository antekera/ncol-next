export function fetcher(url: string) {
  return fetch(url, { cache: 'no-store' }).then(res => res.json())
}
