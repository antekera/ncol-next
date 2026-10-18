interface YoutubePlayer {
  destroy: () => void
}
interface YoutubeApi {
  Player: new (
    frame: HTMLIFrameElement,
    options: {
      events: {
        onStateChange: (event: { data: number }) => void
        onReady: (event: { target: { getPlayerState: () => number } }) => void
      }
    }
  ) => YoutubePlayer
}
type YoutubeWindow = Window & {
  YT?: YoutubeApi
  onYouTubeIframeAPIReady?: () => void
}
let pending: Promise<YoutubeApi | undefined> | undefined

function loadApi(): Promise<YoutubeApi | undefined> {
  const host = window as YoutubeWindow
  if (host.YT?.Player) return Promise.resolve(host.YT)
  if (pending) return pending
  pending = new Promise(resolve => {
    const previous = host.onYouTubeIframeAPIReady
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
    const script = existing ?? document.createElement('script')
    let completed = false
    const finish = (api?: YoutubeApi) => {
      if (completed) return
      completed = true
      clearTimeout(timer)
      script.removeEventListener('error', failed)
      if (host.onYouTubeIframeAPIReady === ready)
        host.onYouTubeIframeAPIReady = previous
      if (!api) {
        pending = undefined
        if (!existing) script.remove()
      }
      resolve(api)
    }
    const ready = () => {
      try {
        previous?.()
      } finally {
        finish(host.YT?.Player ? host.YT : undefined)
      }
    }
    const failed = () => finish()
    const timer = setTimeout(failed, 15000)
    host.onYouTubeIframeAPIReady = ready
    script.addEventListener('error', failed, { once: true })
    if (!existing) {
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.append(script)
    }
  })
  return pending
}

/** Called only after activation. SDK events, never iframe focus, prove play. */
export function observeYoutubePlayback(
  frame: HTMLIFrameElement,
  onPlay: () => void
) {
  let stopped = false
  let player: YoutubePlayer | undefined
  void loadApi().then(api => {
    if (stopped || !frame.isConnected || !api) return
    try {
      player = new api.Player(frame, {
        events: {
          onReady: event => {
            if (!stopped && event.target.getPlayerState() === 1) onPlay()
          },
          onStateChange: event => {
            if (!stopped && event.data === 1) onPlay()
          }
        }
      })
    } catch {
      /* A blocked SDK must not prevent native iframe playback. */
    }
  })
  return () => {
    stopped = true
    try {
      player?.destroy()
    } catch {
      /* The external player may already be gone. */
    }
    player = undefined
  }
}
