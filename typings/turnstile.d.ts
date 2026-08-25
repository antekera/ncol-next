export {}

declare global {
  interface Window {
    turnstile?: {
      reset(widget: HTMLElement): unknown
      getResponse: () => string
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          'error-callback'?: (errorCode: string) => boolean
        }
      ) => void
    }
  }
}
