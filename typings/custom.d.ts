declare module 'react-gtm-module'
declare module '@sect/react-dfp'
declare module '@next/third-parties/google'
declare module '@taboola/taboola-react-web'
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
