import { log } from '@logtail/next'
import { TIME_REVALIDATE } from '@lib/constants'

type Params = Record<string, string | number | boolean | undefined>

type Headers = {
  'Content-Type'?: string
  'Cache-Control'?: string
  Authorization?: string
  Origin?: string
  Referer?: string
  [key: string]: string | undefined
}

type BodyValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, unknown>

export interface HttpResponse<T> {
  data: T | null
  error?: {
    message: string
    details?: any
  }
  status: number
}

enum SupportedHTTPMethods {
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  POST = 'POST',
  DELETE = 'DELETE'
}

type RequestOptions = {
  body?: BodyValue
  endpoint: string
  headers?: Headers
  method: SupportedHTTPMethods
  params?: Params
  revalidate?: number
}

type Config = Pick<RequestOptions, 'headers' | 'params' | 'revalidate'>

class HttpClient {
  private static instance: HttpClient
  private debugMode: boolean = false

  constructor(debugMode = false) {
    if (HttpClient.instance) {
      return HttpClient.instance
    }
    this.debugMode = debugMode
    HttpClient.instance = this
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }

  private buildQueryString(params: Params = {}): string {
    if (Object.keys(params).length === 0) return ''
    return `?${Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&')}`
  }

  private getBaseHeaders(): Headers {
    const headers: Headers = {
      'Content-Type': 'application/json'
    }

    if (typeof process !== 'undefined') {
      if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
        headers.Authorization = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
      }

      const origin = process.env.SITE_URL || 'http://localhost:3000'

      headers.Origin = origin
      headers.Referer = `${origin}/`

      if (process.env.WORDPRESS_GRAPHQL_SECRET) {
        headers['X-NCOL-ORIGIN'] = process.env.WORDPRESS_GRAPHQL_SECRET
      }
    }

    return headers
  }

  private async fetch<T>({
    body,
    endpoint,
    headers = {},
    method,
    params = {},
    revalidate
  }: RequestOptions): Promise<HttpResponse<T>> {
    const url = `${endpoint}${this.buildQueryString(params)}`

    const requestHeaders = {
      ...this.getBaseHeaders(),
      ...headers
    }

    if (this.debugMode) {
      log.info(`HttpClient: ${method} ${url}`, {
        body,
        headers: requestHeaders
      })
    }

    const options: RequestInit = {
      method,
      headers: requestHeaders as any,
      body: body ? JSON.stringify(body) : null,
      next: {
        revalidate: revalidate ?? TIME_REVALIDATE.WEEK
      }
    } as any

    try {
      const response = await fetch(url, options)

      let data: T | null = null
      const text = await response.text()

      if (text) {
        try {
          data = JSON.parse(text)
        } catch (error) {
          log.error('HttpClient: Failed to parse JSON', {
            url,
            origin,
            text: text.substring(0, 100),
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }

      if (!response.ok) {
        return {
          data,
          status: response.status,
          error: {
            message: `Request failed with status ${response.status}`,
            details: data
          }
        }
      }

      if (this.debugMode) {
        log.info(`HttpClient: Success ${response.status} ${url}`, { data })
      }

      return { data, status: response.status }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      log.error('HttpClient: Fetch Exception', { url, origin, message })
      return {
        data: null,
        status: 500,
        error: { message }
      }
    }
  }

  public async get<T>(
    endpoint: string,
    config: Config = {}
  ): Promise<HttpResponse<T>> {
    return this.fetch<T>({
      ...config,
      endpoint,
      method: SupportedHTTPMethods.GET
    })
  }

  public async post<T>(
    endpoint: string,
    body?: BodyValue,
    config: Config = {}
  ): Promise<HttpResponse<T>> {
    return this.fetch<T>({
      ...config,
      endpoint,
      body,
      method: SupportedHTTPMethods.POST
    })
  }
}

export { HttpClient }
