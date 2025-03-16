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
      invalidation: {
        paths: ['/2025/*', '/2026/*'],
        wait: false
      }
    })
  }
})
