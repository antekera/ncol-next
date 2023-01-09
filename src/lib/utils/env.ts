const DEVELOPMENT = 'development'

export const isDev = () => {
  return process.env.NODE_ENV === DEVELOPMENT
}
