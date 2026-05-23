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
    // Fail fast on production deploys if domain vars are missing —
    // without them SST removes the CloudFront CNAME aliases for www.noticiascol.com
    if ($app.stage === 'production') {
      const required = [
        'DOMAIN_NAME',
        'HOSTED_ZONE_ID',
        'YOUR_CF_DISTRIBUTION_ID',
        'REVALIDATE_SECRET'
      ]
      const missing = required.filter(k => !process.env[k])
      if (missing.length) {
        throw new Error(
          `Missing required env vars for production deploy: ${missing.join(', ')}`
        )
      }
    }

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
          },
          // Grant Lambda permission to invalidate CloudFront — no credentials needed in env
          policies: [
            {
              actions: ['cloudfront:CreateInvalidation'],
              resources: [
                `arn:aws:cloudfront::${process.env.AWS_ACCOUNT_ID}:distribution/${process.env.YOUR_CF_DISTRIBUTION_ID}`
              ]
            }
          ]
        } as any,
        cdn: {
          transform: {
            distribution: (args: any) => {
              args.priceClass = 'PriceClass_200'
            }
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
        REVALIDATE_SECRET: process.env.REVALIDATE_SECRET ?? '',
        FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY ?? '',
        SITE_URL: process.env.DOMAIN_NAME
          ? `https://www.${process.env.DOMAIN_NAME}`
          : 'http://localhost:3000',
        YOUR_CF_DISTRIBUTION_ID: process.env.YOUR_CF_DISTRIBUTION_ID ?? '',
        WORDPRESS_GRAPHQL_SECRET: process.env.WORDPRESS_GRAPHQL_SECRET ?? '',
        WP_USER: process.env.WP_USER ?? '',
        WP_PASSWORD: process.env.WP_PASSWORD ?? '',
        TURSO_DB_URL: process.env.TURSO_DB_URL ?? '',
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? '',
        TURSO_DOLAR_DB_URL: process.env.TURSO_DOLAR_DB_URL ?? '',
        TURSO_DOLAR_AUTH_TOKEN: process.env.TURSO_DOLAR_AUTH_TOKEN ?? '',
        TURSO_HOROSCOPO_DB_URL: process.env.TURSO_HOROSCOPO_DB_URL ?? '',
        TURSO_HOROSCOPO_AUTH_TOKEN:
          process.env.TURSO_HOROSCOPO_AUTH_TOKEN ?? '',
        RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
        TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
        MOST_VISITED_DAYS: process.env.MOST_VISITED_DAYS ?? ''
      }
    })
  }
})
