import { DEVELOPMENT, PRODUCTION } from '@lib/constants'

export const isDev = () => {
  return process.env.NODE_ENV === DEVELOPMENT
}

export const isProd = () => {
  return process.env.NODE_ENV === PRODUCTION
}
