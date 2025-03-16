// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: `${process.env.APP_NAME}`,
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws'
    }
  },
  async run() {
    new sst.aws.Nextjs(`${process.env.APP_NAME}`, {
      domain: {
        name: `${process.env.DOMAIN_NAME}`,
        redirects: [` www.${process.env.DOMAIN_NAME}/*`],
        // dns: sst.aws.dns(),
        cert: `${process.env.CERT_ARN}`,
        aliases: [`cdn.${process.env.DOMAIN_NAME}`]
      },
      invalidation: {
        paths: ['/2025/*', '/2026/*'],
        wait: false
      }
    })
  }
})
