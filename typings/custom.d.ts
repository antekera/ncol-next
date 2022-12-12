declare module 'nprogress'
declare module 'react-gtm-module'
declare module '@sect/react-dfp'
declare module 'react-stickynode'
declare global {
  interface Window {
    googletag: any
    dataLayer: Record<string, any>[]
    adsbygoogle: {
      push: (p: Record<string, never>) => void
    }
    _taboola: any
  }
}
