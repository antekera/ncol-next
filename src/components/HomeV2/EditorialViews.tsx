import type { ReactNode } from 'react'
import type { HomeArticle } from '@lib/homeV2/types'
import {
  sameEditorialArticles,
  type HomeEditorialEdition
} from '@lib/homeV2/editorialEditions'
import { EditorialSlot, type EditorialVersion } from './DailyBoundary'

/** Render only distinct module states. Functions stay on the server; the
 * client receives timestamps and rendered nodes, never a rendering callback. */
export function EditorialViews({
  editions,
  select,
  render
}: {
  editions: readonly HomeEditorialEdition[]
  select: (edition: HomeEditorialEdition) => readonly HomeArticle[]
  render: (edition: HomeEditorialEdition, initial: boolean) => ReactNode
}) {
  const versions: EditorialVersion[] = []
  let previous: readonly HomeArticle[] | undefined
  for (const edition of editions) {
    const articles = select(edition)
    if (previous && sameEditorialArticles(previous, articles)) continue
    versions.push({
      at: edition.at,
      content: render(edition, versions.length === 0)
    })
    previous = articles
  }
  return <EditorialSlot versions={versions} />
}
