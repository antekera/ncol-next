import { log } from '@logtail/next'
import { TIME_REVALIDATE } from '@lib/constants'

type Params = Record<string, string | number | boolean | undefined>

type Headers = {
  'Content-Type'?: string
  'Cache-Control'?: string
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

type RequestOptions = {
  body?: BodyValue
  endpoint: string
  headers?: Headers
  method: SupportedHTTPMethods
  params?: Params
  revalidate?: number
}

type Endpoint = RequestOptions['endpoint']

type Config = Pick<RequestOptions, 'headers' | 'params' | 'revalidate'>

type HttpError = {
  status?: number
  statusText?: string
  url?: string
  data?: any
  message: string
  originalError?: Error
  timestamp: string
  requestDetails?: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: string
  }
}

export const generateBaseHeaders = () => {
  const baseHeaders: Headers = {
    'Content-Type': 'application/json'
  }

  return baseHeaders
}

class HttpClient {
  private url: string | undefined
  private debugMode: boolean

  constructor(url?: string, debugMode = false) {
    this.url = url
    this.debugMode = this.shouldEnableDebugMode() || debugMode
  }

  /**
   * Builds a query string from parameters
   */
  private buildQueryString(params: Params = {}): string {
    if (Object.keys(params).length === 0) return ''

    return `?${Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(
        ([key, value = '']) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&')}`
  }

  /**
   * Creates request options object
   */
  private createRequestOptions(
    method: SupportedHTTPMethods,
    headers: Headers = {},
    body?: BodyValue,
    revalidate?: number
  ): RequestInit & { next: { revalidate: number } } {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : null,
      next: {
        revalidate: revalidate ?? TIME_REVALIDATE.WEEK
      }
    }
  }

  /**
   * Logs request information if debug is enabled
   */
  private logRequest(
    method: string,
    url: string,
    body?: BodyValue,
    isDebugEnabled = false
  ): void {
    if (!isDebugEnabled) return

    log.info(`🚀 HTTP ${method} Request: ${url}`)
    if (body) log.info('Request body:', body)
  }

  /**
   * Logs response information if debug is enabled
   */
  private logResponse(
    method: string,
    url: string,
    data: any,
    isDebugEnabled = false
  ): void {
    if (!isDebugEnabled) return

    log.info(`✅ HTTP ${method} Response: ${url}`)
    log.info('Response data:', data)
  }

  /**
   * Handles error responses
   */
  private handleErrorResponse(
    response: Response,
    url: string,
    method: string,
    headers: Record<string, string>,
    body: string | null
  ): Promise<never> {
    return this.safelyParseResponse(response)
      .catch(e => ({ parseError: e.message }))
      .then(errorData => {
        throw this.createErrorObject(
          `Request failed with status ${response.status}`,
          {
            status: response.status,
            statusText: response.statusText,
            url,
            data: errorData,
            requestDetails: {
              method,
              url,
              headers,
              body: body || undefined
            }
          }
        )
      })
  }

  /**
   * Processes successful responses
   */
  private async processSuccessResponse(
    response: Response,
    method: string,
    url: string,
    isDebugEnabled: boolean
  ) {
    const data = await this.safelyParseResponse(response)
    this.logResponse(method, url, data, isDebugEnabled)
    return data
  }

  /**
   * Handles non-HttpError exceptions
   */
  private handleFetchException(
    error: unknown,
    endpoint: string,
    method: string,
    headers?: Headers,
    body?: BodyValue
  ): never {
    // If it's already our structured error, just re-throw it
    if (error && typeof error === 'object' && 'timestamp' in error) {
      throw error
    }

    // Handle network errors and other exceptions
    if (error instanceof Error) {
      const errorObj = this.createErrorObject(
        error.message.includes('fetch failed')
          ? `Network error: Failed to connect to ${endpoint}. Check your network connection.`
          : `Request to ${endpoint} failed: ${error.message}`,
        {
          originalError: error,
          requestDetails: {
            method,
            url: `${this?.url || ''}${endpoint}`,
            headers: headers as Record<string, string>,
            body: body ? JSON.stringify(body) : undefined
          }
        }
      )

      throw errorObj
    }

    // For unknown errors
    throw this.createErrorObject(`Unknown error during fetch to ${endpoint}`, {
      originalError: error instanceof Error ? error : undefined
    })
  }

  /**
   * Creates the request URL with query parameters
   */
  private buildRequestUrl(endpoint: string, params: Params = {}): string {
    const queryString = this.buildQueryString(params)
    return `${this?.url || ''}${endpoint}${queryString}`
  }

  /**
   * Checks if debug mode should be enabled based on URL parameter
   */
  private shouldEnableDebugMode(): boolean {
    return this?.debugMode ?? false
  }

  /**
   * Logs errors in a structured format
   * @param error - The error to log
   */
  private logError(error: HttpError): void {
    if (!this.shouldEnableDebugMode() && !this.debugMode) return

    log.error('-----HTTP CLIENT ERROR-----')
    log.error(`Time: ${error.timestamp}`)
    log.error(`Message: ${error.message}`)

    if (error.status) {
      log.error(`Status: ${error.status} ${error.statusText || ''}`)
    }

    if (error.url) {
      log.error(`URL: ${error.url}`)
    }

    if (error.requestDetails) {
      log.error(JSON.stringify(error.requestDetails, null, 2))
    }

    if (error.data) {
      log.error('Response Data:', error.data)
    }

    if (error.originalError) {
      log.error('Original Error:', error.originalError)
    }

    log.error('----------------------------')
  }

  /**
   * Creates a structured error object
   */
  private createErrorObject(
    message: string,
    details: Partial<HttpError> = {}
  ): HttpError {
    const error: HttpError = {
      message,
      timestamp: new Date().toISOString(),
      ...details
    }

    this.logError(error)
    return error
  }

  /**
   * Safely parses JSON response or returns the text content if parsing fails
   * @param response - The fetch response object
   * @returns A promise that resolves to the parsed response or text
   */
  private async safelyParseResponse(response: Response) {
    const contentType = response.headers.get('content-type') || ''

    // Handle different content types appropriately
    if (contentType.includes('application/json')) {
      try {
        return await response.json()
      } catch (error) {
        // If JSON parsing fails, get the text and throw a better error
        const text = await response.text()
        const errorMessage = `Failed to parse JSON response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`

        throw this.createErrorObject(errorMessage, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          originalError: error instanceof Error ? error : undefined,
          data: { responseText: text }
        })
      }
    } else {
      // For non-JSON responses, return text content
      const text = await response.text()

      // Try to parse it as JSON anyway in case content-type is wrong
      try {
        return JSON.parse(text)
      } catch {
        // If it's not JSON, return the text or structured error
        if (!response.ok) {
          throw this.createErrorObject(`HTTP Error ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            data: { responseText: text.substring(0, 500) }
          })
        }
        return { text }
      }
    }
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
    params = {},
    revalidate
  }: RequestOptions) {
    const isDebugEnabled = this.isDebugModeEnabled()

    try {
      // Build URL and request options
      const url = this.buildRequestUrl(endpoint, params)
      const options = this.createRequestOptions(
        method,
        headers,
        body,
        revalidate
      )

      // Log request information
      this.logRequest(method, url, body, isDebugEnabled)

      // Make the request
      const response = await fetch(url, options)

      // Handle error responses
      if (!response.ok) {
        return this.handleErrorResponse(
          response,
          url,
          method,
          options.headers as Record<string, string>,
          options.body as string
        )
      }

      // Process successful response
      return this.processSuccessResponse(response, method, url, isDebugEnabled)
    } catch (error) {
      return this.handleFetchException(error, endpoint, method, headers, body)
    }
  }

  post(
    endpoint: Endpoint,
    body?: BodyValue,
    { headers, params, revalidate }: Config = {}
  ) {
    return this.fetch({
      body,
      endpoint,
      headers,
      method: SupportedHTTPMethods.POST,
      params,
      revalidate
    })
  }

  get(endpoint: Endpoint, { headers, params, revalidate }: Config = {}) {
    return this.fetch({
      endpoint,
      headers,
      method: SupportedHTTPMethods.GET,
      params,
      revalidate
    })
  }

  /**
   * Checks if debug mode is currently enabled
   */
  isDebugModeEnabled(): boolean {
    return this.shouldEnableDebugMode() || this.debugMode
  }
}

export { HttpClient }
