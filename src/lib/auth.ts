import { HttpClient } from '@lib/httpClient'

const client = new HttpClient()
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string

export async function loginUser(username?: string, password?: string) {
  // Check if token already exists
  if (typeof window !== 'undefined') {
    const existingToken = localStorage.getItem('wp_jwt_token')
    if (existingToken) {
      return { authToken: existingToken }
    }
  }

  // If no credentials provided, we can't login
  if (!username || !password) {
    throw new Error('No credentials provided for login')
  }

  const query = `
    mutation LoginUser($input: LoginInput!) {
      login(input: $input) {
        authToken
        user {
          id
          name
        }
      }
    }
  `

  const { data } = await client.post(API_URL, {
    query,
    variables: {
      input: {
        clientMutationId: 'uniqueId',
        username: username,
        password: password
      }
    }
  })

  if (data?.data?.login?.authToken) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wp_jwt_token', data.data.login.authToken)
    }
    return data.data.login
  }

  throw new Error('Login failed')
}
