declare module 'nprogress'
declare module 'react-gtm-module'
declare global {
  interface Window {
    googletag: any
    adsbygoogle: any
    _taboola: any
  }
}
