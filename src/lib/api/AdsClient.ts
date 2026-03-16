import { BaseClient } from './BaseClient'

export class AdsClient extends BaseClient {
  /**
   * Fetches active ads from the preferred data source (WP or custom API)
   */
  async getActiveAds() {
    // Placeholder logic - to be implemented when the Ads API is ready
    return this.post({ query: '{ ads { nodes { id title } } }' })
  }
}
