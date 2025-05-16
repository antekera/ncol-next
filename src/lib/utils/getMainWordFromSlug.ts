export const getMainWordFromSlug = (phrase: string | undefined) => {
  const words = phrase?.split('-')
  return words?.reduce((acc, curr) => {
    return curr.length > acc.length ? curr : acc
  }, '')
}
