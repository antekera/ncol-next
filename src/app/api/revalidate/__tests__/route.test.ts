/** @jest-environment node */
import { NextRequest } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { GET } from '../route'
import { requestPublicHomeSnapshot } from '@lib/homeV2/publicSnapshot'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))
jest.mock('@lib/homeV2/publicSnapshot', () => ({
  requestPublicHomeSnapshot: jest.fn()
}))
const original = process.env
beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...original,
    REVALIDATE_SECRET: 'fixture-only',
    HOME_V2_PUBLIC_ENABLED: 'false',
    HOME_V2_DURABLE_CACHE_ENABLED: 'false'
  }
})

it('queues a public publication without regenerating Home, while still invalidating internal routes', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'true'
  process.env.HOME_V2_DURABLE_CACHE_ENABLED = 'true'
  expect((await GET(request(['/', '/', ...paths.slice(1)]))).status).toBe(200)
  expect(requestPublicHomeSnapshot).toHaveBeenCalledTimes(1)
  expect(revalidatePath).not.toHaveBeenCalledWith('/')
  expect(revalidateTag).not.toHaveBeenCalledWith(
    'home-v2-public',
    expect.anything()
  )
  expect(revalidateTag).not.toHaveBeenCalledWith('post-/', expect.anything())
  for (const path of paths.slice(1))
    expect(revalidatePath).toHaveBeenCalledWith(path)
})
afterEach(() => {
  process.env = original
})
const paths = [
  '/',
  '/categoria/nacionales/',
  '/2026/10/23/noticia/',
  '/etiqueta/politica/'
]
const request = (values = paths, secret = 'fixture-only') =>
  new NextRequest(
    `https://example.com/api/revalidate?${new URLSearchParams({ secret, paths: JSON.stringify(values) })}`
  )

it('preserves immediate invalidation for the legacy Home and internal pages by default', async () => {
  expect((await GET(request())).status).toBe(200)
  for (const path of paths) expect(revalidatePath).toHaveBeenCalledWith(path)
  for (const tag of [
    'homepage',
    'featured-post',
    'category-nacionales',
    'post-/2026/10/23/noticia',
    'tag-politica'
  ]) {
    expect(revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 })
  }
})

it('marks only public V2 stale while preserving immediate article/category invalidation in the same publication', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'true'
  expect((await GET(request())).status).toBe(200)
  expect(revalidateTag).toHaveBeenCalledWith('home-v2-public', 'max')
  expect(revalidatePath).not.toHaveBeenCalledWith('/')
  for (const path of paths.slice(1))
    expect(revalidatePath).toHaveBeenCalledWith(path)
  expect(revalidateTag).toHaveBeenCalledWith('category-nacionales', {
    expire: 0
  })
  expect(revalidateTag).toHaveBeenCalledWith('post-/2026/10/23/noticia', {
    expire: 0
  })
})

it('does not invalidate the public Home for a category-only update', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'true'
  await GET(request(['/categoria/sucesos/']))
  expect(revalidateTag).not.toHaveBeenCalledWith(
    'home-v2-public',
    expect.anything()
  )
  expect(revalidatePath).toHaveBeenCalledWith('/categoria/sucesos/')
})

it('deduplicates the root in a publication batch', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'true'
  await GET(request(['/', '/', '/categoria/zulia/']))
  expect(
    jest
      .mocked(revalidateTag)
      .mock.calls.filter(([tag]) => tag === 'home-v2-public')
  ).toHaveLength(1)
})

it.each(['wrong', ''])(
  'rejects unauthorized calls before any cache change: %s',
  async secret => {
    expect((await GET(request(paths, secret))).status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  }
)

it('rejects cache changes when the server secret is missing', async () => {
  delete process.env.REVALIDATE_SECRET
  expect((await GET(request())).status).toBe(401)
  expect(revalidatePath).not.toHaveBeenCalled()
  expect(revalidateTag).not.toHaveBeenCalled()
})

it.each([
  { values: [] },
  { values: ['https://example.com/'] },
  { values: ['//example.com/'] },
  { values: Array.from({ length: 51 }, () => '/') }
])(
  'rejects invalid publication paths before any cache change: $values',
  async ({ values }) => {
    expect((await GET(request(values))).status).toBe(400)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  }
)
