export const REACTIONS = [
  { key: 'cry', emoji: '😭', label: 'Triste' },
  { key: 'love', emoji: '❤️', label: 'Me encanta' },
  { key: 'mind_blown', emoji: '🤯', label: 'Sorprendente' },
  { key: 'angry', emoji: '😡', label: 'Indignante' },
  { key: 'thumbs_up', emoji: '👍', label: 'Me gusta' },
  { key: 'lol', emoji: '😂', label: 'Divertido' },
  { key: 'grimace', emoji: '😬', label: 'Incómodo' },
  { key: 'eyeroll', emoji: '🙄', label: 'Increíble' }
] as const

export type ReactionKey = (typeof REACTIONS)[number]['key']

export const REACTION_KEYS: ReadonlySet<string> = new Set(
  REACTIONS.map(r => r.key)
)

export type ReactionCounts = Record<ReactionKey, number>

export const emptyReactionCounts = (): ReactionCounts =>
  REACTIONS.reduce((acc, r) => {
    acc[r.key] = 0
    return acc
  }, {} as ReactionCounts)

export const isReactionKey = (value: unknown): value is ReactionKey =>
  typeof value === 'string' && REACTION_KEYS.has(value)
