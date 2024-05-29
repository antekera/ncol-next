type Params = Record<string, string | number | boolean | undefined>

type Headers = {
  'Content-Type'?: string
  Authorization?: string
}

type BodyValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, unknown>

export type FetchResponse<T> = Response & {
  data: T
}

enum SupportedHTTPMethods {
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  POST = 'POST',
  DELETE = 'DELETE'
}

type Body = BodyValue | unknown

type RequestOptions = {
  method: SupportedHTTPMethods
  endpoint: string
  headers?: Headers
  params?: Params
  body?: Body
}

type Endpoint = RequestOptions['endpoint']

type Config = Pick<RequestOptions, 'headers' | 'params'>

export const generateBaseHeaders = () => {
  const baseHeaders: Headers = {
    'Content-Type': 'application/json'
  }
  return baseHeaders
}

class HttpClient {
  private url: string | undefined

  constructor(url?: string) {
    this.url = url
  }

  /**
   * Fetches data from the specified endpoint.
   * @param requestOptions - The options for the request.
   * @returns A promise that resolves to the response data.
   */
  private async fetch({
    body,
    endpoint,
    headers,
    method,
    params = {}
  }: RequestOptions) {
    const stringParams: string =
      Object.keys(params).length > 0
        ? `?${Object.entries(params)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(
              ([key, value = '']) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join('&')}`
        : ''
    const res = await fetch(
      `${this?.url ? this.url : ''}${endpoint}${stringParams}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : null
      }
    )

    if (!res.ok) {
      throw await res.json()
    }

    return res.json()
  }

  get(endpoint: Endpoint, { headers, params }: Config = {}) {
    return this.fetch({
      endpoint,
      headers,
      method: SupportedHTTPMethods.GET,
      params
    })
  }

  post(endpoint: Endpoint, body?: Body, { headers, params }: Config = {}) {
    return this.fetch({
      body,
      endpoint,
      headers,
      method: SupportedHTTPMethods.POST,
      params
    })
  }

  put(endpoint: Endpoint, body?: Body, { headers, params }: Config = {}) {
    return this.fetch({
      body,
      endpoint,
      headers,
      method: SupportedHTTPMethods.PUT,
      params
    })
  }

  patch(endpoint: Endpoint, body?: Body, { headers, params }: Config = {}) {
    return this.fetch({
      body,
      endpoint,
      headers,
      method: SupportedHTTPMethods.PATCH,
      params
    })
  }

  delete(endpoint: Endpoint, body?: Body, { headers, params }: Config = {}) {
    return this.fetch({
      body,
      endpoint,
      headers,
      method: SupportedHTTPMethods.DELETE,
      params
    })
  }
}

export { HttpClient }
