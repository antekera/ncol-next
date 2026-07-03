/* eslint-disable sonarjs/slow-regex */
export function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .slice(0, 3000)
}
/* eslint-enable sonarjs/slow-regex */
