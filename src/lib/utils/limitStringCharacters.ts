const MAX_CHARACTERS = 180

export const limitStringCharacters = (
  input: string,
  limit = MAX_CHARACTERS
) => {
  if (input.length <= limit) {
    return input
  }
  return input.slice(0, limit) + '...'
}
