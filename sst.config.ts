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
      domain:
        process.env.DOMAIN_NAME &&
        process.env.HOSTED_ZONE_ID &&
        $app.stage === 'production'
          ? {
              name: `www.${process.env.DOMAIN_NAME}`,
              redirects: [process.env.DOMAIN_NAME],
              ...(process.env.CERT_ARN ? { cert: process.env.CERT_ARN } : {}),
              dns: sst.aws.dns({ zone: process.env.HOSTED_ZONE_ID })
            }
          : undefined,
      imageOptimization: {
        memory: '512 MB',
        staticEtag: true
      },
      invalidation: {
        paths: ['/*'],
        wait: true
      },
      transform: {
        server: {
          loggingConfig: {
            logFormat: 'JSON',
            systemLogLevel: 'WARN',
            applicationLogLevel: 'WARN'
          }
        }
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
        MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID ?? '',
        TINYBIRD_TOKEN: process.env.TINYBIRD_TOKEN ?? '',
        TINYBIRD_URL: process.env.TINYBIRD_URL ?? '',
        SITE_URL: process.env.DOMAIN_NAME
          ? `https://www.${process.env.DOMAIN_NAME}`
          : 'http://localhost:3000'
      }
    })
  }
})
