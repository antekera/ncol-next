/** @jest-environment node */
import { createServer, type Server } from 'node:http'
import { revalidateTag } from 'next/cache'
import { deliverPublicHomeSnapshot } from '../publicSnapshotDelivery'
import { publicHomeSnapshotTag } from '../publicCachePolicy'

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }))
const original = process.env
const key = 'home-v2-raw-v1:local:receipt-fixture'
const marker = `${publicHomeSnapshotTag(key)}:2`
let server: Server
let html: string
let flight: string
let requests: { url?: string; headers: Record<string, unknown> }[]
let mode: 'healthy' | 'redirect' | 'hang' | 'large' | 'canonical' | 'bad-key'
let redirectLocation: string
beforeEach(async () => {
  jest.clearAllMocks()
  html = marker
  flight = marker
  mode = 'healthy'
  requests = []
  redirectLocation = '/?_rsc=correct-key'
  server = createServer((request, response) => {
    requests.push({ url: request.url, headers: request.headers })
    if (mode === 'hang') return
    if (mode === 'redirect') {
      response.writeHead(302, { location: '/login' }).end()
      return
    }
    const rsc = request.headers.rsc === '1'
    if (
      rsc &&
      (mode === 'bad-key' ||
        (mode === 'canonical' && request.url?.includes('home-cache-receipt')))
    ) {
      response.writeHead(307, { location: redirectLocation }).end()
      return
    }
    response.setHeader('Content-Type', rsc ? 'text/x-component' : 'text/html')
    const body = rsc
      ? `0:{"data-home-snapshot":"${flight}"}`
      : `<div data-home-snapshot="${html}">Home</div>`
    response.end(mode === 'large' ? 'x'.repeat(4 * 1024 * 1024 + 1) : body)
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('No fixture port')
  process.env = {
    ...original,
    VERCEL: '0',
    HOME_V2_PUBLIC_ENABLED: 'true',
    HOME_V2_CACHE_RECOVERY_ORIGIN: `http://127.0.0.1:${address.port}`
  }
})
afterEach(async () => {
  process.env = original
  server.closeAllConnections()
  await new Promise<void>(resolve => server.close(() => resolve()))
})

it('confirms the exact published revision through ordinary HTML and Flight requests', async () => {
  expect(await deliverPublicHomeSnapshot(key, 2)).toBe(true)
  expect(revalidateTag).not.toHaveBeenCalled()
  expect(requests).toHaveLength(2)
  for (const request of requests) {
    expect(request.headers['cache-control']).toBeUndefined()
    expect(request.headers.pragma).toBeUndefined()
    expect(request.headers.authorization).toBeUndefined()
    expect(request.headers.cookie).toBeUndefined()
  }
  expect(
    requests
      .map(request => request.url)
      .sort((a, b) => (a ?? '').localeCompare(b ?? ''))
  ).toEqual(['/', '/?_rsc=home-cache-receipt'])
})

it.each(['html', 'flight'])(
  'keeps delivery pending if %s still serves another revision',
  async type => {
    if (type === 'html') html = `${publicHomeSnapshotTag(key)}:1`
    else flight = `${publicHomeSnapshotTag(key)}:1`
    expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
    expect(revalidateTag).toHaveBeenCalledWith(
      publicHomeSnapshotTag(key),
      'max'
    )
  }
)

it.each(['/?_rsc=correct-key', '/?_rsc'])(
  'follows only the Next same-page RSC cache-key redirect: %s',
  async location => {
    mode = 'canonical'
    redirectLocation = location
    expect(await deliverPublicHomeSnapshot(key, 2)).toBe(true)
    expect(requests).toHaveLength(3)
    expect(requests[2].url).toBe(location)
  }
)

it.each([
  // eslint-disable-next-line sonarjs/no-clear-text-protocols -- malformed loopback fixture location, never contacted
  'http://[',
  '/login?_rsc=key',
  'https://other.example/?_rsc=key',
  '/?_rsc=key&other=1',
  'http://user:password@127.0.0.1/?_rsc=key',
  '/?_rsc=correct-key'
])(
  'does not follow an invalid redirect or redirect loop: %s',
  async location => {
    mode = 'bad-key'
    redirectLocation = location
    expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
    expect(requests.length).toBeLessThanOrEqual(3)
  }
)

it('does not accept the same revision from another deployment namespace', async () => {
  html = flight = `${publicHomeSnapshotTag('other-preview')}:2`
  expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
})

it.each(['redirect', 'large'] as const)(
  'does not acknowledge %s responses',
  async value => {
    mode = value
    expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
    expect(requests).toHaveLength(2)
  }
)

it('bounds and cancels unresponsive receipt requests', async () => {
  mode = 'hang'
  const began = performance.now()
  expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
  expect(performance.now() - began).toBeLessThan(4000)
  expect(revalidateTag).toHaveBeenCalledTimes(1)
})

it('leaves prewarm delivery pending without fetching the public legacy Home', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'false'
  expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
  expect(requests).toHaveLength(0)
})

it('does not infer a receipt origin when deployment configuration is missing', async () => {
  delete process.env.HOME_V2_CACHE_RECOVERY_ORIGIN
  expect(await deliverPublicHomeSnapshot(key, 2)).toBe(false)
  expect(requests).toHaveLength(0)
})
