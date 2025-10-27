import { getCategoryNode } from '../getCategoryNode'

describe('getCategoryNode', () => {
  test('returns null when no data', () => {
    expect(getCategoryNode(undefined as any)).toBeNull()
  })

  test('filters out filtered categories and returns first valid node', () => {
    const data = {
      edges: [
        { node: { name: '_Pos_Columna_der' } },
        { node: { name: 'Nacionales' } },
        { node: { name: '_Pos_Columna_izq' } }
      ],
      type: ''
    } as any
    const node = getCategoryNode(data)
    expect(node).toEqual({ name: 'Nacionales' })
  })
})
