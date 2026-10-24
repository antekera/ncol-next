import { HttpClient, HttpResponse } from '@lib/httpClient'
import { log } from '@logtail/next'
import * as Sentry from '@sentry/nextjs'

export abstract class BaseClient {
  protected apiUrl: string

  constructor(
    protected client: HttpClient,
    apiUrl?: string
  ) {
    this.apiUrl = (
      apiUrl ||
      process.env.WORDPRESS_API_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
      ''
    ).trim()
    if (!this.apiUrl) {
      log.error(`${this.constructor.name}: API URL is not defined`)
    }
  }

  protected async post<T>(
    body: any,
    options: RequestInit & { revalidate?: number } = {}
  ): Promise<T | null> {
    return (await this.postResult<T>(body, options)).data
  }

  // Preserve GraphQL integrity for consumers that persist editorial snapshots.
  // Existing post() consumers still receive usable partial data as before.
  protected async postResult<T>(
    body: any,
    options: RequestInit & { revalidate?: number } = {}
  ): Promise<{ data: T | null; hasErrors: boolean }> {
    try {
      if (!this.apiUrl) return { data: null, hasErrors: true }

      const response = await this.client.post<T>(
        this.apiUrl,
        body,
        options as any
      )

      if (response.error || !response.data) {
        this.logError(response)
        return { data: null, hasErrors: true }
      }

      const result = response.data as any
      if (result?.errors) {
        log.error(`${this.constructor.name} GraphQL Errors`, {
          errors: result.errors,
          status: response.status
        })
      }

      return {
        data: result?.data ?? null,
        hasErrors: Array.isArray(result?.errors) && result.errors.length > 0
      }
    } catch (error) {
      Sentry.captureException(error)
      return { data: null, hasErrors: true }
    }
  }

  private logError(response: HttpResponse<any>) {
    const errorMsg = response.error
      ? `[${response.status}] ${response.error.message}`
      : 'No data received'

    log.error(`${this.constructor.name} Request Failed`, {
      error: errorMsg,
      status: response.status
    })
  }
}
