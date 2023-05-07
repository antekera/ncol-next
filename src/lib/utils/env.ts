import { DEVELOPMENT } from '@lib/constants'

export const isDev = () => {
  return process.env.NODE_ENV === DEVELOPMENT
}
