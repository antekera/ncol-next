import { createServer } from 'node:http'
import { spawn, execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  createWriteStream,
  readFileSync
} from 'node:fs'
import { resolve, relative, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
// Real Next production runtime, with no environment files or external CMS writes.
// A new output directory keeps previous evidence and cache states intact.
assert.equal(Number(process.versions.node.split('.')[0]), 24, 'Use Node 24')
const root = fileURLToPath(new URL('../../', import.meta.url))
const args = process.argv.slice(2)
assert.equal(args[0], '--output')
assert.equal(args.length, 2)
const base = resolve(args[1])
const insideSource = relative(resolve(root, 'src'), base)
assert.ok(
  insideSource === '..' ||
    insideSource.startsWith(`..${sep}`) ||
    isAbsolute(insideSource),
  'Output cannot be inside src: source copying would include its own output'
)
mkdirSync(base)
const source = resolve(base, 'source'),
  app = resolve(base, 'app')
mkdirSync(source)
mkdirSync(app)
cpSync(resolve(root, 'src'), resolve(source, 'src'), { recursive: true })
symlinkSync(resolve(root, 'node_modules'), resolve(app, 'node_modules'))
const save = (file, data) => {
  const target = resolve(app, file)
  mkdirSync(resolve(target, '..'), { recursive: true })
  writeFileSync(target, data)
}
save(
  'package.json',
  JSON.stringify({
    private: true,
    dependencies: Object.fromEntries(
      ['next', 'react', 'react-dom'].map(name => [
        name,
        JSON.parse(
          readFileSync(resolve(root, 'node_modules', name, 'package.json'))
        ).version
      ])
    )
  })
)
save(
  'next.config.mjs',
  `export default {outputFileTracingRoot:${JSON.stringify(root)},typescript:{ignoreBuildErrors:true},experimental:{externalDir:true},webpack(config){config.resolve.alias['@lib']=${JSON.stringify(resolve(source, 'src/lib'))};config.resolve.alias['@app']=${JSON.stringify(resolve(source, 'src/app'))};return config}}`
)
save(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      lib: ['dom', 'esnext'],
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      paths: {
        '@lib/*': [resolve(source, 'src/lib/*')],
        '@app/*': [resolve(source, 'src/app/*')]
      }
    },
    include: ['app/**/*.tsx', 'app/**/*.ts']
  })
)
save(
  'app/layout.tsx',
  `export default function Layout({children}:{children:React.ReactNode}){return <html><body>{children}</body></html>}`
)
save(
  'app/page.tsx',
  `import {getHomeV2Data} from ${JSON.stringify(resolve(source, 'src/lib/homeV2/getHomeV2Data'))}; import {getFeaturedPost} from ${JSON.stringify(resolve(source, 'src/app/actions/getFeaturedPost'))}; export const dynamic='force-dynamic'; export default async function Page(){const [a,b,control]=await Promise.all([getHomeV2Data(),getHomeV2Data(),getFeaturedPost()]); return <pre id="data">{JSON.stringify({controlFeatured:control?.id,featured:a.featured,errors:a.errors,counts:Object.fromEntries(Object.entries(a.sections).map(([k,v])=>[k,v.length])),same:a===b})}</pre>}`
)
save(
  'app/api/revalidate/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/revalidate/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
save(
  'app/api/region/route.ts',
  `import {getHomeV2Region} from ${JSON.stringify(resolve(source, 'src/app/actions/getHomeV2Region'))}; export const dynamic='force-dynamic'; export async function GET(){return Response.json(await getHomeV2Region('zulia'))}`
)
let state = { version: 1, mode: 'modules-fail' },
  counts = { taxonomies: 0, modules: 0, control: 0 }
const checks = []
const fixture = createServer(async (req, res) => {
  let body = ''
  for await (const chunk of req) body += chunk
  const { query } = JSON.parse(body)
  res.setHeader('Content-Type', 'application/json')
  if (query.includes('RecentFromCategory')) {
    counts.control++
    return res.end(
      JSON.stringify({
        data: {
          posts: {
            edges: [
              {
                node: {
                  id: `p${state.version}`,
                  title: `Control ${state.version}`,
                  uri: `/nota-${state.version}/`,
                  categories: { edges: [] },
                  customFields: { noticiadestacada: true }
                }
              }
            ]
          }
        }
      })
    )
  }
  if (query.includes('HomeEditorialTaxonomies')) {
    counts.taxonomies++
    if (state.mode === 'taxonomies-fail') {
      res.statusCode = 503
      return res.end('{}')
    }
    return res.end(
      JSON.stringify({
        ...(state.mode === 'taxonomy-partial'
          ? { errors: [{ message: 'fixture taxonomy partial' }] }
          : {}),
        data: {
          categories: {
            nodes: [
              '_pos_columna_izq',
              'zulia',
              'nacionales',
              'sucesos',
              'internacionales',
              'deportes',
              'tendencias',
              'entretenimiento'
            ].map((slug, i) => ({
              id: `c${i}`,
              databaseId: i + 1,
              slug,
              name: slug,
              parentId: null
            })),
            pageInfo: { hasNextPage: false, endCursor: null }
          }
        }
      })
    )
  }
  if (!query.includes('HomeEditorialModules')) {
    res.statusCode = 400
    return res.end('{}')
  }
  counts.modules++
  if (state.mode === 'modules-fail') {
    res.statusCode = 503
    return res.end('{}')
  }
  const data = Object.fromEntries(
    [...query.matchAll(/(m\d+): posts/g)].map(([, key]) => [
      key,
      {
        nodes: [
          {
            id: `${query.match(/m\d+: posts/g).length === 1 ? 'r' : 'p'}${state.version}`,
            title: `Noticia ${state.version}`,
            uri: `/nacionales/10/18/nota-${state.version}/`,
            categories: { edges: [] },
            featuredImage: null,
            customFields: { noticiadestacada: true }
          }
        ]
      }
    ])
  )
  res.end(
    JSON.stringify({
      data,
      ...(state.mode === 'partial-error' || state.mode === 'region-partial'
        ? {
            errors: [
              {
                message: 'fixture resolver failed',
                path: ['m2', 'nodes', 0, 'featuredImage']
              }
            ]
          }
        : {})
    })
  )
})
const listen = server =>
  new Promise((ok, no) => {
    server.once('error', no)
    server.listen(0, '127.0.0.1', ok)
  })
await listen(fixture)
const wpPort = fixture.address().port
const reserve = createServer()
await listen(reserve)
const port = reserve.address().port
await new Promise(r => reserve.close(r))
const env = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  HOME_V2_PREVIEW_ENABLED: 'true',
  WORDPRESS_API_URL: `http://127.0.0.1:${wpPort}`,
  NEXT_PUBLIC_WORDPRESS_API_URL: `http://127.0.0.1:${wpPort}`,
  REVALIDATE_SECRET: 'local-cache-fixture-only'
}
const run = (args, log) =>
  new Promise((ok, no) => {
    const out = createWriteStream(resolve(base, log))
    const p = spawn(
      process.execPath,
      [resolve(root, 'node_modules/next/dist/bin/next'), ...args],
      { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    const timer = setTimeout(() => p.kill('SIGTERM'), 120_000)
    p.stdout.pipe(out)
    p.stderr.pipe(out)
    p.once('error', error => {
      clearTimeout(timer)
      no(error)
    })
    p.once('exit', code => {
      clearTimeout(timer)
      if (code === 0) ok()
      else no(Error(`${args[0]} exited ${code}; see ${log}`))
    })
  })
let child
try {
  await run(['build', '--webpack'], 'build.log')
  const out = createWriteStream(resolve(base, 'server.log'))
  child = spawn(
    process.execPath,
    [
      resolve(root, 'node_modules/next/dist/bin/next'),
      'start',
      '-p',
      String(port),
      '-H',
      '127.0.0.1'
    ],
    { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  child.stdout.pipe(out)
  child.stderr.pipe(out)
  const url = `http://127.0.0.1:${port}`
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`${url}/api/revalidate`, {
        signal: AbortSignal.timeout(1000)
      })
      break
    } catch {
      await new Promise(r => setTimeout(r, 200))
    }
  }
  const read = async () => {
    const r = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    assert.equal(r.status, 200)
    assert.match(r.headers.get('cache-control') ?? '', /private.*no-store/)
    const html = await r.text()
    const raw = html.match(/<pre id="data">(.*?)<\/pre>/s)?.[1]
    assert.ok(raw, 'server summary')
    return {
      data: JSON.parse(
        raw
          .replaceAll('&quot;', '"')
          .replaceAll('&amp;', '&')
          .replaceAll('&#x27;', "'")
          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')
      ),
      cacheControl: r.headers.get('cache-control'),
      counts: { ...counts }
    }
  }
  const record = (name, result) => {
    checks.push({ name, ...result })
    console.log(name, JSON.stringify(result))
  }
  const invalidate = async (path, secret = 'local-cache-fixture-only') => {
    const r = await fetch(
      `${url}/api/revalidate?secret=${secret}&path=${encodeURIComponent(path)}`
    )
    return r.status
  }
  record('outage', await read())
  assert.ok(checks.at(-1).data.errors.includes('opening'))
  state.mode = 'healthy'
  record('recovery', await read())
  assert.equal(checks.at(-1).data.featured?.id, 'p1')
  assert.deepEqual(checks.at(-1).data.errors, [])
  assert.equal(checks.at(-1).data.same, true)
  record('hit', await read())
  assert.deepEqual(
    checks.at(-1).counts,
    checks.at(-2).counts,
    'persistent cache should avoid both queries'
  )
  state.version = 2
  record('before-invalidation', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p1')
  assert.equal(await invalidate('/', 'wrong'), 401)
  record('unauthorized-no-refresh', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p1')
  assert.equal(await invalidate('/categoria/nacionales/'), 200)
  record('category-refreshed', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p2')
  assert.equal(checks.at(-1).data.controlFeatured, 'p1')
  assert.equal(checks.at(-1).counts.modules, checks.at(-2).counts.modules + 1)
  state.version = 3
  assert.equal(await invalidate('/'), 200)
  record('root-refreshed', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p3')
  assert.equal(checks.at(-1).data.controlFeatured, 'p3')
  state.mode = 'taxonomies-fail'
  await invalidate('/')
  record('taxonomy-outage', await read())
  assert.deepEqual(checks.at(-1).data.errors, ['taxonomies'])
  state.mode = 'healthy'
  record('taxonomy-recovery', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p3')
  assert.deepEqual(checks.at(-1).data.errors, [])
  state.mode = 'partial-error'
  await invalidate('/')
  record('partial-error', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p3')
  assert.ok(checks.at(-1).data.errors.includes('modules'))
  state.mode = 'healthy'
  state.version = 4
  record('partial-error-recovery', await read())
  assert.equal(
    checks.at(-1).data.featured.id,
    'p4',
    'GraphQL resolver failure must not persist as a healthy cached hour'
  )
  state.mode = 'taxonomy-partial'
  await invalidate('/')
  record('taxonomy-partial', await read())
  assert.deepEqual(checks.at(-1).data.errors, ['taxonomies'])
  state.mode = 'healthy'
  state.version = 5
  record('taxonomy-partial-recovery', await read())
  assert.equal(checks.at(-1).data.featured.id, 'p5')
  state.mode = 'region-partial'
  const region = async () => {
    const r = await fetch(`${url}/api/region`)
    assert.equal(r.status, 200)
    return { data: await r.json(), counts: { ...counts } }
  }
  record('region-partial', await region())
  assert.equal(checks.at(-1).data.ok, false)
  state.mode = 'healthy'
  state.version = 6
  record('region-recovery', await region())
  assert.equal(checks.at(-1).data.articles[0]?.id, 'r6')
  record('region-hit', await region())
  assert.deepEqual(checks.at(-1).counts, checks.at(-2).counts)
  const files = [
    'src/lib/api/BaseClient.ts',
    'src/lib/api/CategoriesClient.ts',
    'src/lib/api/PostsClient.ts',
    'src/lib/homeV2/types.ts',
    'src/lib/homeV2/loadHomeV2Data.ts',
    'src/lib/homeV2/getHomeV2Data.ts',
    'src/app/actions/getHomeV2Region.ts',
    'src/app/api/revalidate/route.ts',
    'src/app/actions/getFeaturedPost/index.ts',
    'src/app/actions/fetchAPI.ts'
  ]
  writeFileSync(
    resolve(base, 'result.json'),
    JSON.stringify(
      {
        source: execFileSync('git', ['rev-parse', 'HEAD'], {
          encoding: 'utf8'
        }).trim(),
        sourceHashes: Object.fromEntries(
          files.map(file => [
            file,
            createHash('sha256')
              .update(readFileSync(resolve(root, file)))
              .digest('hex')
          ])
        ),
        checks
      },
      null,
      2
    )
  )
  console.log('ALL CACHE CHECKS PASSED')
} finally {
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM')
    await new Promise(r => child.once('exit', r))
  }
  await new Promise(r => fixture.close(r))
}
