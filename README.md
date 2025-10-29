## ncol-next
![image](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![image](	https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![image](https://img.shields.io/badge/Wordpress-21759B?style=for-the-badge&logo=wordpress&logoColor=white)
![image](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![image](https://img.shields.io/badge/GraphQl-E10098?style=for-the-badge&logo=graphql&logoColor=white)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This is the noticiascol.com website which is a news media site based in Venezuela, 
we use next.js in the front layer and WordPress as a backend connected with graphQl.

## Getting Started

```bash
npm install
```

```bash
npm run test:unit
```

```bash
npm run dev
```

## E2E Testing and Standalone Server

This project uses Playwright for E2E. By default, tests start the app with `next start`, which is stable for CI. You can also run against the production-like standalone server produced by `output: 'standalone'`.

- Default (Next server):
  - `npm run test:e2e`

- Standalone (Node server):
  - `USE_STANDALONE=true npm run test:e2e`

Under the hood, when `USE_STANDALONE=true` is set, Playwright runs:

- `npm run build && node .next/standalone/server.js`

Manual smoke run options:

- Default server: `npm run build && npm run start`
- Standalone server: `npm run build && node .next/standalone/server.js`

Use the standalone mode to more closely mirror production runtime when needed. Keep the default mode for fastest, most stable CI runs.
