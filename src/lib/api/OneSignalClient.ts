// Modular client for the OneSignal REST API — push delivery to readers
// subscribed to WordPress tags. Targeting is always by alias
// (external_id = Supabase user id), never by Segment/Data Tag, so the
// free-tier segment limits don't apply — see ncol_tag_subscriptions in
// ncol-legales for the actual "who follows what" data.
type PushPayload = {
  title: string
  url: string
  imageUrl?: string | null
}

export class OneSignalClient {
  // OneSignal accepts several thousand aliases per call — batch
  // conservatively well under any documented limit so a single
  // popular-tag post never fails a whole send because of one oversized
  // request.
  private static readonly BATCH_SIZE = 1900

  private appId: string
  private apiKey: string

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || ''
    this.apiKey = process.env.ONESIGNAL_API_KEY || ''
  }

  private static chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size))
    }
    return chunks
  }

  async sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    if (!this.appId || !this.apiKey) {
      throw new Error(
        'OneSignal is not configured (ONESIGNAL_APP_ID / ONESIGNAL_API_KEY)'
      )
    }

    const batches = OneSignalClient.chunk(userIds, OneSignalClient.BATCH_SIZE)

    for (const batch of batches) {
      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${this.apiKey}`
        },
        body: JSON.stringify({
          app_id: this.appId,
          target_channel: 'push',
          include_aliases: { external_id: batch },
          headings: { es: payload.title },
          contents: { es: 'Toca para leer la noticia completa.' },
          url: payload.url,
          ...(payload.imageUrl
            ? {
                big_picture: payload.imageUrl,
                chrome_web_image: payload.imageUrl
              }
            : {})
        })
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`OneSignal request failed: HTTP ${res.status} - ${body}`)
      }
    }
  }
}

export const oneSignalClient = new OneSignalClient()
