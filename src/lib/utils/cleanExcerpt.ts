/* eslint-disable sonarjs/anchor-precedence */

export const cleanExcerpt = (text?: string): string => {
  return text?.replace(/<p>|<\/p>|&nbsp;|\[&hellip;\]<\/p>$/gim, '') ?? ''
}
