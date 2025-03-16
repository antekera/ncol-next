// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'ncol-next',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-2',
          profile: process.env.GITHUB_ACTIONS
            ? undefined
            : input?.stage === 'production'
              ? 'production'
              : 'dev'
        }
      }
    }
  },
  async run() {
    const github = new aws.iam.OpenIdConnectProvider('GithubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIdLists: ['sts.amazonaws.com']
    })
    const githubRole = new aws.iam.Role('GithubRole', {
      name: [$app.name, $app.stage, 'github'].join('-'),
      assumeRolePolicy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Federated: github.arn
            },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringLike: github.url.apply(url => ({
                [`${url}:sub`]: 'repo:${GITHUB_ORG}/${GITHUB_REPO}:*'
              }))
            }
          }
        ]
      }
    })
    new aws.iam.RolePolicyAttachment('GithubRolePolicy', {
      policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
      role: githubRole.name
    })

    new sst.aws.Nextjs('ncol-next', {
      domain: {
        name: 'noticiascol.com',
        redirects: ['www.noticiascol.com'],
        dns: false,
        cert: 'arn:aws:acm:us-east-1:xxxxxxxxxx'
      }
    })
  }
})
