export const getMainWordFromSlug = (phrase: string) => {
  const words = phrase.split('-')
  const mainWord = words.reduce((acc, curr) => {
    return curr.length > acc.length ? curr : acc
  }, '')

  return mainWord
}
