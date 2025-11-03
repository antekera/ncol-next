export function makeAnchorId(u: string) {
  return `comentarios-${u.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}
