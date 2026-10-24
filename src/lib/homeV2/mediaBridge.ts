export type VideoProvider = 'youtube' | 'dailymotion'
export type NavigationMethod = 'arrow' | 'gesture'
interface MediaOwner {
  play: (element: HTMLElement, provider: VideoProvider, id: string) => void
  navigation: (
    element: HTMLElement,
    from: number,
    to: number,
    method: NavigationMethod
  ) => void
}
const owners = new WeakMap<HTMLElement, MediaOwner>()
function owner(element: HTMLElement) {
  let target: HTMLElement | null = element
  while (target) {
    const found = owners.get(target)
    if (found) return found
    target = target.parentElement
  }
}
/** Scoped to the existing measured exposure; no new event transport or cohort. */
export function registerHomeMedia(root: HTMLElement, handlers: MediaOwner) {
  owners.set(root, handlers)
  return () => {
    if (owners.get(root) === handlers) owners.delete(root)
  }
}
export const isHomeMediaMeasured = (element: HTMLElement) => !!owner(element)
export function reportVideoPlay(
  element: HTMLElement,
  provider: VideoProvider,
  id: string
) {
  owner(element)?.play(element, provider, id)
}
export function reportCarouselNavigation(
  element: HTMLElement,
  from: number,
  to: number,
  method: NavigationMethod
) {
  owner(element)?.navigation(element, from, to, method)
}
