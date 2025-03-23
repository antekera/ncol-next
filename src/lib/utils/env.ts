import { DEVELOPMENT, PRODUCTION } from '@lib/constants'

export const isDev = process.env.NODE_ENV === DEVELOPMENT
export const isProd = process.env.NODE_ENV === PRODUCTION
