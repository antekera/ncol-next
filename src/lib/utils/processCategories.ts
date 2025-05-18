import { FILTERED_CATEGORIES } from '@lib/constants'
import { Categories } from '@lib/types'

export const processCategories = (
  edges: Categories['edges'] | undefined,
  sliceAmount: number
) => {
  if (!edges?.length) {
    return []
  }
  return edges
    .filter(({ node }) => !FILTERED_CATEGORIES.includes(node.name))
    .filter(({ node }, _, array) => {
      const hasParentNull = array.some(item => item.node.parentId === null)
      return hasParentNull ? node.parentId === null : true
    })
    .sort((a, b) => a.node.name.localeCompare(b.node.name))
    .slice(0, sliceAmount)
}
