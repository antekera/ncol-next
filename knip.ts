import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/_app.tsx', 'src/_document', 'src/pages/index.tsx'],
  project: ['src/**/*.{ts,tsx}'],
};

export default config;
