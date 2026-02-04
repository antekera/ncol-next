// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'ncol-next',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      region: 'us-east-1'
    }
  },
  async run() {
    new sst.aws.Nextjs('ncol-next', {
      imageOptimization: {
        memory: '1024 MB',
        staticEtag: true
      },
      invalidation: {
        paths: ['/*'],
        wait: true
      },
      // Environment variables for server-side (Lambda) functions
      // NEXT_PUBLIC_* are automatically inlined at build time from .env
      environment: {
        SENTRY_DSN: process.env.SENTRY_DSN ?? '',
        SENTRY_ORG: process.env.SENTRY_ORG ?? '',
        SENTRY_PROJECT: process.env.SENTRY_PROJECT ?? '',
        WORDPRESS_API_URL: process.env.WORDPRESS_API_URL ?? '',
        WORDPRESS_AUTH_REFRESH_TOKEN:
          process.env.WORDPRESS_AUTH_REFRESH_TOKEN ?? '',
        MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ?? '',
        MAILCHIMP_API_SERVER: process.env.MAILCHIMP_API_SERVER ?? '',
        MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID ?? ''
      }
    })
  }
})
