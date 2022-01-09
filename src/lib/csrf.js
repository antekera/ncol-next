import { nextCsrf } from 'next-csrf'

const options = {
  secret: `${process.env.NEXT_PUBLIC_CSRF_SECRET}`,
}

export const { csrf, csrfToken } = nextCsrf(options)
