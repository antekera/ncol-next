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
      invalidation: false
    })
  }
})
