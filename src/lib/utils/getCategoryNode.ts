import { FILTERED_CATEGORIES } from '@lib/constants'
import { Categories } from '@lib/types'

export const getCategoryNode = (data?: Categories) => {
  if (!data) {
    return null
  }
  const filteredEdges = data.edges.filter(
    edge => !FILTERED_CATEGORIES.includes(edge.node.name)
  )
  return filteredEdges.length > 0 ? filteredEdges?.[0]?.node : null
}
