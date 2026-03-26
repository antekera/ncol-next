import { HttpClient, HttpResponse } from '@lib/httpClient'
import { log } from '@logtail/next'
import * as Sentry from '@sentry/nextjs'

export abstract class BaseClient {
  protected apiUrl: string

  constructor(
    protected client: HttpClient,
    apiUrl?: string
  ) {
    this.apiUrl = (apiUrl || process.env.WORDPRESS_API_URL || '').trim()
    if (!this.apiUrl) {
      log.error(`${this.constructor.name}: API URL is not defined`)
    }
  }

  protected async post<T>(
    body: any,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      if (!this.apiUrl) return null

      const response = await this.client.post<T>(
        this.apiUrl,
        body,
        options as any
      )

      if (response.error || !response.data) {
        this.logError(response)
        return null
      }

      const result = response.data as any
      if (result?.errors) {
        log.error(`${this.constructor.name} GraphQL Errors`, {
          errors: result.errors,
          status: response.status
        })
      }

      return result?.data ?? null
    } catch (error) {
      Sentry.captureException(error)
      return null
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
