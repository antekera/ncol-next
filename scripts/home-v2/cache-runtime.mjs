import { createServer } from 'node:http'
import { spawn, execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  createWriteStream,
  readFileSync,
  readdirSync,
  rmSync,
  renameSync,
  utimesSync,
  statSync
} from 'node:fs'
import { resolve, relative, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createHomeSqlFixture } from './sql-fixture.mjs'
// Real Next production runtime, with no environment files or external CMS writes.
// A new output directory keeps previous evidence and cache states intact.
assert.equal(Number(process.versions.node.split('.')[0]), 24, 'Use Node 24')
const root = fileURLToPath(new URL('../../', import.meta.url))
const args = process.argv.slice(2)
assert.equal(args[0], '--output')
assert.ok(
  args.length === 2 ||
    (args.length === 3 &&
      [
        '--durable',
        '--durable=midnight',
        '--durable=feature',
        '--durable=night',
        '--durable=aged',
        '--durable=render-crossing',
        '--durable=read-crossing',
        '--durable=profile-crossing',
        '--durable=storage-outage',
        '--durable=storage-hang',
        '--public=enabled',
        '--public=disabled',
        '--snapshot=midnight',
        '--deadline=feature',
        '--deadline=midnight'
      ].includes(args[2]))
)
const deadlineScenario = args[2]?.startsWith('--deadline=')
  ? args[2].split('=')[1]
  : undefined
const snapshotScenario = args[2] === '--snapshot=midnight'
const durableBoundary = args[2]?.startsWith('--durable=')
  ? args[2].split('=')[1]
  : undefined
const storageFailure = ['storage-outage', 'storage-hang'].includes(
  durableBoundary
)
const durableScenario = args[2] === '--durable' || !!durableBoundary
const featureFixture =
  deadlineScenario === 'feature' ||
  ['feature', 'aged'].includes(durableBoundary)
const controlledClock =
  !!deadlineScenario || snapshotScenario || durableScenario
const releaseMode = controlledClock ? 'enabled' : args[2]?.split('=')[1]
const base = resolve(args[1])
const insideSource = relative(resolve(root, 'src'), base)
assert.ok(
  insideSource === '..' ||
    insideSource.startsWith(`..${sep}`) ||
    isAbsolute(insideSource),
  'Output cannot be inside src: source copying would include its own output'
)
mkdirSync(base)
const clockFile = resolve(base, 'clock.json')
const recoveryLog = resolve(base, 'recovery-requests.txt')
writeFileSync(recoveryLog, '')
const recoveryRequests = () =>
  readFileSync(recoveryLog, 'utf8').split('\n').filter(Boolean).length
const setClock = value => {
  const temporary = `${clockFile}.next`
  writeFileSync(temporary, String(value))
  renameSync(temporary, clockFile)
}
const initialTime = Date.parse(
  durableBoundary === 'night'
    ? '2026-10-23T04:00:00Z'
    : deadlineScenario === 'feature' ||
        (durableScenario &&
          ![
            'midnight',
            'render-crossing',
            'read-crossing',
            'profile-crossing',
            'storage-outage',
            'storage-hang'
          ].includes(durableBoundary))
      ? '2026-10-23T15:00:00Z'
      : '2026-10-23T03:59:58Z'
)
const deadline = initialTime + (durableBoundary === 'aged' ? 60000 : 2000)
const initialDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Caracas',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date(initialTime))
const ordinaryArticle = {
  id: 'ordinary',
  title: 'Noticia sin fecha explícita',
  date: `${initialDay}T09:00:00-04:00`,
  uri: '/noticia-ordinaria/',
  categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] },
  featuredImage: null,
  customFields: { noticiadestacada: false }
}
const deadlineArticles = [
  {
    ...ordinaryArticle,
    id: featureFixture ? 'manual' : 'dated',
    title: featureFixture
      ? 'Destacada manual fuera de categoría'
      : 'Jornada del 22 de octubre de 2026',
    date: featureFixture
      ? new Date(deadline - 86400000).toISOString()
      : `${initialDay}T10:00:00-04:00`,
    uri: '/noticia-con-vencimiento/',
    categories: {
      edges: [
        {
          node: {
            slug: featureFixture ? 'deportes' : 'zulia',
            name: 'Sección'
          }
        }
      ]
    },
    customFields: { noticiadestacada: featureFixture }
  },
  ordinaryArticle
]
if (controlledClock) {
  setClock(initialTime)
  // Scoped to the fixture's Next subprocesses and workers, never the host clock.
  writeFileSync(
    resolve(base, 'clock.cjs'),
    `const {readFileSync}=require('node:fs'); const NativeDate=Date; const now=()=>Number(readFileSync(${JSON.stringify(clockFile)},'utf8')); function FixtureDate(...args){if(!new.target)return new NativeDate(now()).toString();return Reflect.construct(NativeDate,args.length?args:[now()],new.target)} Object.defineProperties(FixtureDate,Object.getOwnPropertyDescriptors(NativeDate)); FixtureDate.now=now; globalThis.Date=FixtureDate; const monotonicNow=performance.now.bind(performance); Object.defineProperty(performance,'timeOrigin',{get:()=>now()-monotonicNow()});`
  )
}
const source = resolve(base, 'source'),
  app = resolve(base, 'app')
mkdirSync(source)
mkdirSync(app)
cpSync(resolve(root, 'src'), resolve(source, 'src'), { recursive: true })
symlinkSync(resolve(root, 'node_modules'), resolve(app, 'node_modules'))
symlinkSync(resolve(root, 'node_modules'), resolve(source, 'node_modules'))
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
  `export default {outputFileTracingRoot:${JSON.stringify(root)},typescript:{ignoreBuildErrors:true},experimental:{externalDir:true,...(process.env.HOME_V2_PUBLIC_ENABLED==='true'?{useCache:true}:{})},webpack(config){config.resolve.alias['@lib']=${JSON.stringify(resolve(source, 'src/lib'))};config.resolve.alias['@components']=${JSON.stringify(resolve(app, 'fixtures'))};config.resolve.alias['@app']=${JSON.stringify(resolve(source, 'src/app'))};return config}}`
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
// Exercise the actual public route and data layer. Presentation is stubbed only
// in this isolated cache harness; the full app has separate browser/ads tests.
if (releaseMode) {
  save(
    'fixtures/HomeEntry.tsx',
    releaseMode === 'enabled'
      ? `export {default} from ${JSON.stringify(resolve(source, 'src/components/HomeV2/PublicHome'))}`
      : `export {default} from './LegacyHome'`
  )
  save(
    'app/page.tsx',
    readFileSync(resolve(source, 'src/app/page.tsx'), 'utf8').replace(
      /revalidate = \d+/,
      match => (durableBoundary === 'aged' ? 'revalidate = 1' : match)
    )
  )
  save(
    'fixtures/Header.tsx',
    durableBoundary === 'render-crossing'
      ? `import {writeFileSync} from 'node:fs'; export function Header(){if(Date.now()<${deadline})writeFileSync(${JSON.stringify(clockFile)},String(${deadline + 1000}));return <header>NoticiasCol</header>}`
      : 'export function Header(){return <header>NoticiasCol</header>}'
  )
  save(
    'fixtures/LegacyHome.tsx',
    `export default function LegacyHome(){return <pre id="data">{JSON.stringify({variant:'legacy'})}</pre>}`
  )
  save(
    'fixtures/HomeV2.tsx',
    deadlineScenario
      ? `import {DailyBoundary} from ${JSON.stringify(resolve(source, 'src/components/HomeV2/DailyBoundary'))}; import {EditorialViews} from ${JSON.stringify(resolve(source, 'src/components/HomeV2/EditorialViews'))}; import {getHomeEditorialEditions} from '@lib/homeV2/editorialEditions'; import {homeEditorialDay} from '@lib/homeV2/editorialPolicy'; export function HomeV2({data}){const now=Date.now();const editions=getHomeEditorialEditions(data,now);return <DailyBoundary initialNow={now} deadlines={editions.slice(1).map(e=>e.at)}><EditorialViews editions={editions} select={e=>[...(e.data.featured?[e.data.featured]:[]),...Object.values(e.data.sections).flat()]} render={e=><pre id="data">{JSON.stringify({variant:'v2',day:homeEditorialDay(new Date(e.at)),featured:e.data.featured,errors:e.data.errors})}</pre>}/></DailyBoundary>}`
      : `export function HomeV2({data}){return <pre id="data">{JSON.stringify({variant:'v2',featured:data.featured,errors:data.errors,renderedAt:Date.now()})}</pre>}`
  )
}
save(
  'app/api/revalidate/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/revalidate/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
if (snapshotScenario)
  save(
    'app/api/editorial-probe/route.ts',
    `import {getHomeV2Data} from '@lib/homeV2/getHomeV2Data'; export const dynamic='force-dynamic'; export async function GET(){return Response.json(await getHomeV2Data(),{headers:{'Cache-Control':'no-store'}})}`
  )
if (durableScenario)
  save(
    'app/api/home-v2/refresh/route.ts',
    `export {GET,POST,dynamic} from ${JSON.stringify(resolve(source, 'src/app/api/home-v2/refresh/route'))}`
  )
if (durableScenario)
  save(
    'app/api/home-v2/snapshot/route.ts',
    storageFailure
      ? `import {appendFileSync} from 'node:fs'; import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/home-v2/snapshot/route'))}; export const dynamic='force-dynamic';export async function GET(request){appendFileSync(${JSON.stringify(recoveryLog)},'request\\n');return handler(request)}`
      : `export {GET,dynamic} from ${JSON.stringify(resolve(source, 'src/app/api/home-v2/snapshot/route'))}`
  )
save(
  'app/api/region/route.ts',
  `import {getHomeV2Region} from ${JSON.stringify(resolve(source, 'src/app/actions/getHomeV2Region'))}; export const dynamic='force-dynamic'; export async function GET(){return Response.json(await getHomeV2Region('zulia'))}`
)
save(
  'app/api/home-v2/region/[day]/[region]/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/home-v2/region/[day]/[region]/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
save(
  'app/api/opinion/authors/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/opinion/authors/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
let state = { version: 1, mode: releaseMode ? 'healthy' : 'modules-fail' },
  counts = { taxonomies: 0, modules: 0, control: 0, opinion: 0, photos: 0 }
const checks = []
const fixture = createServer(async (req, res) => {
  if (deadlineScenario && req.url === '/__fixture/clock') {
    let body = ''
    for await (const chunk of req) body += chunk
    const { now } = JSON.parse(body)
    if (![initialTime, deadline + 1000].includes(now)) {
      res.statusCode = 400
      return res.end()
    }
    setClock(now)
    res.statusCode = 204
    return res.end()
  }
  if (req.url?.startsWith('/wp-json/ncol/v1/users/')) {
    counts.photos++
    res.setHeader('Content-Type', 'application/json')
    assert.equal(req.headers['x-opinion-secret'], 'local-opinion-fixture-only')
    return res.end(
      JSON.stringify({ foto_perfil_url: 'https://example.com/portrait.jpg' })
    )
  }
  let body = ''
  for await (const chunk of req) body += chunk
  const { query } = JSON.parse(body)
  res.setHeader('Content-Type', 'application/json')
  if (query.includes('OpinionAuthors')) {
    counts.opinion++
    if (state.mode === 'opinion-fail') {
      res.statusCode = 503
      return res.end('{}')
    }
    return res.end(
      JSON.stringify({
        data: {
          posts: {
            edges: Array.from({ length: 6 }, (_, i) => ({
              node: {
                id: `opinion-${i}`,
                title: 'Columna',
                uri: `/columna-${i}/`,
                author: {
                  node: {
                    databaseId: i + 1,
                    name: 'Autor',
                    slug: `autor-${i}`,
                    uri: `/autor/autor-${i}/`,
                    avatar: { url: 'https://example.com/avatar.jpg' }
                  }
                }
              }
            }))
          }
        }
      })
    )
  }
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
        nodes: controlledClock
          ? durableScenario
            ? deadlineArticles.map(article => ({
                ...article,
                id: article.id + '-v' + state.version
              }))
            : deadlineArticles
          : [
              {
                id: `${query.match(/m\d+: posts/g).length === 1 ? 'r' : 'p'}${state.version}`,
                title: `Noticia ${state.version}`,
                date: `${new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())}T08:00:00`,
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
let crossedRead = false
const sqlFixture = durableScenario
  ? await createHomeSqlFixture(root, base, {
      afterRead(query) {
        if (
          durableBoundary === 'read-crossing' &&
          !crossedRead &&
          /^select \"payload\"/i.test(query)
        ) {
          crossedRead = true
          setClock(deadline + 1000)
        }
      }
    })
  : undefined
const sourceOverrides = new Map()
if (durableBoundary === 'profile-crossing') {
  const file = 'src/lib/homeV2/publicHomeLifetime.ts'
  const path = resolve(source, file)
  const original = readFileSync(path, 'utf8')
  sourceOverrides.set(file, {
    original,
    reason: 'Advance only the fixture clock inside the awaited cache scope'
  })
  writeFileSync(
    path,
    "import {writeFileSync} from 'node:fs';\n" +
      original.replace(
        "'use cache'",
        "'use cache'\n  if(Date.now()<" +
          deadline +
          ')writeFileSync(' +
          JSON.stringify(clockFile) +
          ',String(' +
          (deadline + 5000) +
          '));'
      )
  )
}
const env = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  ...(sqlFixture
    ? {
        HOME_V2_DURABLE_CACHE_ENABLED: 'true',
        TURSO_DB_URL: sqlFixture.url,
        TURSO_AUTH_TOKEN: 'local-sql-fixture',
        CRON_SECRET: 'local-processor-fixture',
        HOME_V2_CACHE_RECOVERY_ORIGIN: `http://127.0.0.1:${port}`
      }
    : {}),
  ...(controlledClock
    ? {
        NODE_OPTIONS: `--require=${JSON.stringify(resolve(base, 'clock.cjs'))}`
      }
    : {}),
  HOME_V2_PREVIEW_ENABLED: 'true',
  ...(releaseMode
    ? {
        HOME_V2_PUBLIC_ENABLED: String(releaseMode === 'enabled'),
        VERCEL: storageFailure ? '0' : '1',
        VERCEL_ENV: 'production'
      }
    : {}),
  WORDPRESS_API_URL: `http://127.0.0.1:${wpPort}`,
  NEXT_PUBLIC_WORDPRESS_API_URL: `http://127.0.0.1:${wpPort}`,
  REVALIDATE_SECRET: 'local-cache-fixture-only',
  WORDPRESS_OPINION_API_URL: `http://127.0.0.1:${wpPort}/wp-json/ncol/v1`,
  WORDPRESS_OPINION_API_SECRET: 'local-opinion-fixture-only'
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
const url = `http://127.0.0.1:${port}`
const start = async () => {
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
}
const stop = async () => {
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM')
    const deadline = setTimeout(() => child.kill('SIGKILL'), 2000)
    await new Promise(r => child.once('exit', r))
    clearTimeout(deadline)
  }
}
const normalizeClockFiles = (directory, at) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) normalizeClockFiles(path, at)
    else if (
      directory.includes('fetch-cache') ||
      /\.(html|rsc|meta)$/.test(entry.name)
    ) {
      if (entry.name.endsWith('.meta')) {
        const value = JSON.parse(readFileSync(path, 'utf8'))
        value.routeCacheLastModified = at
        writeFileSync(path, JSON.stringify(value))
      }
      utimesSync(path, new Date(at), new Date(at))
    }
  }
}
try {
  if (durableScenario) {
    // Prewarm through the actual protected processor while the public Home is
    // still off. Only local fixture URLs/tokens exist in these subprocesses.
    env.HOME_V2_PUBLIC_ENABLED = 'false'
    save('fixtures/HomeEntry.tsx', `export {default} from './LegacyHome'`)
    await run(['build', '--webpack'], 'prewarm-build.log')
    await start()
    const denied = await fetch(`${url}/api/home-v2/refresh`, {
      method: 'POST',
      headers: { authorization: 'Bearer incorrect' }
    })
    assert.equal(denied.status, 401)
    assert.equal(
      sqlFixture.counts.requests,
      0,
      'unauthorized prewarm cannot reach storage'
    )
    const seeded = await fetch(`${url}/api/home-v2/refresh`, {
      method: 'POST',
      headers: { authorization: 'Bearer local-processor-fixture' }
    })
    assert.equal(seeded.status, 200, await seeded.text())
    assert.equal(counts.taxonomies, 1)
    assert.equal(counts.modules, 1)
    await stop()
    renameSync(resolve(app, '.next'), resolve(app, '.next-prewarm'))
    env.HOME_V2_PUBLIC_ENABLED = 'true'
    save(
      'fixtures/HomeEntry.tsx',
      `export {default} from ${JSON.stringify(resolve(source, 'src/components/HomeV2/PublicHome'))}`
    )
  }
  await run(['build', '--webpack'], 'build.log')
  if (controlledClock) {
    console.log(
      'editorial-deadline-initial-cms-queries',
      JSON.stringify(counts)
    )
    // Align this isolated cache with its controlled process clock. Filesystem
    // mtimes otherwise use the real clock and would invalidate the scenario.
    const builtAt = Number(readFileSync(clockFile, 'utf8'))
    normalizeClockFiles(resolve(app, '.next/server'), builtAt)
    normalizeClockFiles(resolve(app, '.next/cache/fetch-cache'), builtAt)
  }
  await start()
  const read = async (path = '/', timeoutMs = 30000) => {
    const r = await fetch(`${url}${path}`, {
      signal: AbortSignal.timeout(timeoutMs)
    })
    assert.equal(r.status, 200)
    assert.match(
      r.headers.get('cache-control') ?? '',
      releaseMode ? /s-maxage=/ : /private.*no-store/
    )
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
      cacheStatus: r.headers.get('x-nextjs-cache'),
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
  if (durableBoundary) {
    const initial = await read()
    const baseline = { ...counts }
    if (storageFailure)
      assert.equal(
        recoveryRequests(),
        0,
        'healthy builds/reads do not call the HTTP recovery route'
      )
    const sqlBaseline = { ...sqlFixture.counts }
    const manifest = JSON.parse(
      readFileSync(resolve(app, '.next/prerender-manifest.json'), 'utf8')
    )
    record('durable-boundary-initial', {
      scenario: durableBoundary,
      ...initial,
      policy: manifest.routes['/']
    })
    const ordinary = 'ordinary-v1'
    if (durableBoundary === 'night') {
      assert.ok(
        manifest.routes['/'].initialRevalidateSeconds >= 21599,
        'midnight Home must retain approximately six hours, not the old two-hour page cap'
      )
      for (const minutes of [1, 5, 10, 20]) {
        setClock(initialTime + minutes * 60000)
        assert.equal((await read()).cacheStatus, 'HIT')
      }
      assert.deepEqual(counts, baseline)
      assert.deepEqual(sqlFixture.counts, sqlBaseline)
      state.version = 2
      await invalidate('/')
      setClock(initialTime + 1800000)
      const response = await fetch(`${url}/api/home-v2/refresh`, {
        method: 'POST',
        headers: { authorization: 'Bearer local-processor-fixture' }
      })
      assert.equal(response.status, 200)
      assert.equal((await response.json()).status, 'updated')
      let changed
      for (let n = 0; n < 100; n++) {
        changed = await read()
        if (
          changed.data.featured.id === 'ordinary-v2' &&
          changed.cacheStatus === 'HIT'
        )
          break
        await new Promise(r => setTimeout(r, 20))
      }
      assert.equal(
        changed.data.featured.id,
        'ordinary-v2',
        'nighttime publication must not wait six hours'
      )
      record('durable-night-publication', changed)
      const refreshed = { ...counts }
      for (const minutes of [60, 120, 180, 300, 359]) {
        setClock(initialTime + minutes * 60000)
        assert.equal((await read()).cacheStatus, 'HIT')
      }
      assert.deepEqual(counts, refreshed)
      setClock(initialTime + 6 * 3600000 + 1000)
      const day = await read()
      assert.equal(day.cacheStatus, 'REVALIDATED')
      const seconds = Number(/s-maxage=(\d+)/.exec(day.cacheControl)?.[1])
      assert.ok(
        seconds > 0 && seconds <= 1800,
        'daytime policy must return to the batch cadence'
      )
      assert.deepEqual(counts, refreshed)
      record('durable-night-to-day', day)
    } else if (
      ['render-crossing', 'read-crossing', 'profile-crossing'].includes(
        durableBoundary
      )
    ) {
      if (durableBoundary === 'read-crossing')
        assert.equal(
          crossedRead,
          true,
          'the SQL read must actually cross midnight'
        )
      assert.equal(initial.data.featured.id, ordinary)
      assert.deepEqual(counts, {
        taxonomies: 1,
        modules: 1,
        control: 0,
        opinion: 0,
        photos: 0
      })
      record('durable-render-crossing-valid', initial)
      if (durableBoundary === 'profile-crossing') {
        assert.equal(
          Number(readFileSync(clockFile, 'utf8')),
          deadline + 5000,
          'the async cache scope must cross the deadline'
        )
        setClock(deadline + 7000)
        const settled = await read()
        assert.equal(settled.data.featured.id, ordinary)
        assert.equal(settled.cacheStatus, 'REVALIDATED')
        assert.ok(
          Number(/s-maxage=(\d+)/.exec(settled.cacheControl)?.[1]) > 1800,
          'the conservative short profile must recover to the night policy'
        )
        assert.deepEqual(counts, baseline)
        record('durable-profile-crossing-settled', settled)
      }
    } else {
      assert.equal(
        initial.data.featured.id,
        (featureFixture ? 'manual' : 'dated') + '-v1'
      )
      if (durableBoundary === 'aged') {
        for (const advance of [2000, 4000]) {
          setClock(initialTime + advance)
          let refreshed
          for (let n = 0; n < 100; n++) {
            refreshed = await read()
            if (refreshed.data.renderedAt === initialTime + advance) break
            await new Promise(r => setTimeout(r, 20))
          }
          assert.equal(refreshed.data.renderedAt, initialTime + advance)
        }
      }
      state.mode = 'modules-fail'
      if (storageFailure)
        sqlFixture.setAvailable(
          durableBoundary === 'storage-hang' ? 'hang' : false
        )
      setClock(deadline + 1000)
      const readFlight = async () => {
        const response = await fetch(`${url}/?_rsc=editorial-boundary`, {
          headers: { RSC: '1' }
        })
        assert.equal(response.status, 200)
        assert.match(
          response.headers.get('content-type') ?? '',
          /text\/x-component/
        )
        const flight = await response.text()
        assert.ok(flight.includes('Noticia sin fecha explícita'))
        assert.ok(
          !flight.includes(
            featureFixture
              ? 'Destacada manual fuera de categoría'
              : 'Jornada del 22 de octubre de 2026'
          ),
          'the cached RSC must not retain the expired story'
        )
        return { cacheStatus: response.headers.get('x-nextjs-cache') }
      }
      if (durableBoundary === 'feature') {
        const firstFlight = await readFlight()
        assert.equal(firstFlight.cacheStatus, 'REVALIDATED')
        record('durable-boundary-first-rsc', firstFlight)
      }
      const began = performance.now()
      const expired = await read(
        '/',
        durableBoundary === 'storage-hang' ? 4000 : 30000
      )
      const recoveryMs = performance.now() - began
      if (durableBoundary === 'storage-hang') {
        assert.ok(
          recoveryMs < 3000,
          'healthy-cache recovery must not wait for an unresponsive SQL endpoint'
        )
        for (let n = 0; n < 100 && sqlFixture.stalls.active; n++)
          await new Promise(r => setTimeout(r, 10))
        assert.equal(
          sqlFixture.stalls.active,
          0,
          'timed-out SQL fetches must be cancelled'
        )
      }
      assert.equal(
        expired.data.featured.id,
        ordinary,
        'first HTTP after the editorial boundary must exclude the expired story'
      )
      assert.equal(
        expired.cacheStatus,
        durableBoundary === 'feature' ? 'HIT' : 'REVALIDATED'
      )
      assert.deepEqual(
        counts,
        baseline,
        'eligibility changes must not query WordPress'
      )
      record('durable-boundary-expired-html', {
        ...expired,
        ...(storageFailure ? { recoveryMs } : {})
      })
      if (storageFailure) {
        assert.equal(recoveryRequests(), 1)
        const entry = readdirSync(resolve(app, '.next/cache/fetch-cache')).find(
          file =>
            JSON.parse(
              readFileSync(
                resolve(app, '.next/cache/fetch-cache', file),
                'utf8'
              )
            ).tags?.some(tag => tag.startsWith('home-v2-snapshot:'))
        )
        assert.ok(entry)
        assert.equal(
          Math.round(
            statSync(resolve(app, '.next/cache/fetch-cache', entry)).mtimeMs
          ),
          initialTime,
          'a recovered old snapshot must not be republished as a fresh data-cache entry'
        )
      }
      record('durable-boundary-cached-rsc', await readFlight())
      if (storageFailure) {
        // The first recovered write has its own cache timestamp. Normalize its
        // disk mtime before restart, then exceed that write's six-hour lifetime.
        await stop()
        normalizeClockFiles(
          resolve(app, '.next/server/route-cache'),
          deadline + 1000
        )
        await start()
        setClock(initialTime + 6 * 3600000 + 6000)
        const unavailable = await read()
        assert.equal(unavailable.cacheStatus, 'REVALIDATED')
        assert.equal(
          unavailable.data.renderedAt,
          initialTime + 6 * 3600000 + 6000
        )
        assert.equal(unavailable.data.featured.id, ordinary)
        assert.deepEqual(counts, baseline)
        record('durable-storage-outage-after-data-expiry', {
          ...unavailable,
          recoveryRequests: recoveryRequests(),
          sql: { ...sqlFixture.counts }
        })
        assert.equal(recoveryRequests(), 2)
      }
    }
    const healthy = { ...counts }
    const sqlWarm = { ...sqlFixture.counts }
    const visits = await Promise.all(Array.from({ length: 20 }, () => read()))
    assert.ok(visits.every(view => view.cacheStatus === 'HIT'))
    assert.deepEqual(counts, healthy)
    assert.deepEqual(sqlFixture.counts, sqlWarm)
    await stop()
    if (storageFailure)
      normalizeClockFiles(
        resolve(app, '.next/server/route-cache'),
        Number(readFileSync(clockFile, 'utf8'))
      )
    await start()
    assert.equal((await read()).cacheStatus, 'HIT')
    assert.deepEqual(counts, healthy)
    record('durable-boundary-warm-restart', {
      visits: 20,
      counts: { ...counts },
      sql: { ...sqlFixture.counts },
      ...(storageFailure ? { recoveryRequests: recoveryRequests() } : {})
    })
    if (storageFailure) {
      assert.equal(
        recoveryRequests(),
        2,
        '20 HIT and restart do not add recovery requests'
      )
      const beforeAuth = { ...sqlFixture.counts }
      assert.equal((await fetch(`${url}/api/home-v2/snapshot`)).status, 401)
      assert.equal(
        (
          await fetch(`${url}/api/home-v2/snapshot`, {
            headers: {
              authorization: 'Bearer local-processor-fixture',
              'x-ncol-home-key': 'other-preview'
            }
          })
        ).status,
        409
      )
      assert.deepEqual(sqlFixture.counts, beforeAuth)
      sqlFixture.setAvailable(true)
      state.mode = 'healthy'
      state.version = 2
      await invalidate('/')
      setClock(initialTime + 6.5 * 3600000 + 6000)
      const result = await fetch(`${url}/api/home-v2/refresh`, {
        method: 'POST',
        headers: { authorization: 'Bearer local-processor-fixture' }
      })
      assert.equal(result.status, 200)
      let recovered
      for (let n = 0; n < 100; n++) {
        recovered = await read()
        if (
          recovered.data.featured.id === 'ordinary-v2' &&
          recovered.cacheStatus === 'HIT'
        )
          break
        await new Promise(r => setTimeout(r, 20))
      }
      assert.equal(recovered.data.featured.id, 'ordinary-v2')
      assert.equal(counts.taxonomies, 2)
      assert.equal(counts.modules, 2)
      record('durable-storage-recovered-publication', recovered)
      await stop()
      normalizeClockFiles(
        resolve(app, '.next/server/route-cache'),
        Number(readFileSync(clockFile, 'utf8'))
      )
      for (const file of readdirSync(resolve(app, '.next/cache/fetch-cache')))
        rmSync(resolve(app, '.next/cache/fetch-cache', file))
      sqlFixture.setAvailable(
        durableBoundary === 'storage-hang' ? 'hang' : false
      )
      setClock(initialTime + 7 * 3600000 + 6000)
      await start()
      const attempts = sqlFixture.counts.requests
      const failedAt = performance.now()
      const absent = await fetch(url, { signal: AbortSignal.timeout(10000) })
      assert.equal(absent.status, 500)
      if (durableBoundary === 'storage-hang') {
        for (let n = 0; n < 100 && sqlFixture.stalls.active; n++)
          await new Promise(r => setTimeout(r, 10))
        assert.equal(
          sqlFixture.stalls.active,
          0,
          'a missing cache must not leave hung SQL requests alive'
        )
      }
      assert.ok(performance.now() - failedAt < 10000)
      assert.ok(
        sqlFixture.counts.requests - attempts <= 10,
        'no recursive storage/recovery loop'
      )
      assert.equal(
        counts.modules,
        2,
        'a missing backup must not cause visitor CMS calls'
      )
      record('durable-storage-missing-backup-bounded', {
        status: absent.status,
        sqlAttempts: sqlFixture.counts.requests - attempts,
        ...(durableBoundary === 'storage-hang'
          ? { stalls: { ...sqlFixture.stalls } }
          : {}),
        counts: { ...counts }
      })
      sqlFixture.setAvailable(true)
      setClock(initialTime + 7 * 3600000 + 37000)
      let restored
      for (let n = 0; n < 100; n++) {
        restored = await read()
        if (restored.data.renderedAt === initialTime + 7 * 3600000 + 37000)
          break
        await new Promise(r => setTimeout(r, 20))
      }
      assert.equal(
        restored.data.renderedAt,
        initialTime + 7 * 3600000 + 37000,
        'recovery must actually render from the restored store'
      )
      assert.equal(restored.data.featured.id, 'ordinary-v2')
      assert.equal(counts.modules, 2)
      record('durable-storage-cold-read-restored', restored)
    }
  } else if (durableScenario) {
    const processBatch = async (expectedStatus = 200) => {
      const response = await fetch(`${url}/api/home-v2/refresh`, {
        method: 'POST',
        headers: { authorization: 'Bearer local-processor-fixture' }
      })
      assert.equal(response.status, expectedStatus)
      return response.json()
    }
    const waitForVersion = async version => {
      for (let i = 0; i < 100; i++) {
        const result = await read()
        if (
          result.data.featured?.id.endsWith(`-v${version}`) &&
          result.cacheStatus === 'HIT'
        )
          return result
        await new Promise(r => setTimeout(r, 20))
      }
      throw Error(`Published snapshot v${version} never reached cached HTML`)
    }
    record('durable-initial-home', await read())
    assert.equal(counts.taxonomies, 1)
    assert.equal(counts.modules, 1)
    const readEntries = readdirSync(resolve(app, '.next/cache/fetch-cache'))
      .map(file =>
        JSON.parse(
          readFileSync(resolve(app, '.next/cache/fetch-cache', file), 'utf8')
        )
      )
      .filter(entry =>
        entry.tags?.some(tag => tag.startsWith('home-v2-snapshot:'))
      )
    assert.equal(readEntries.length, 1)
    assert.ok(
      readEntries[0].revalidate > 0 && readEntries[0].revalidate <= 21600,
      'the native read copy must have a bounded fallback when invalidation is unavailable'
    )
    record('durable-bounded-read-copy', {
      seconds: readEntries[0].revalidate,
      tags: readEntries[0].tags
    })
    const initial = { ...counts },
      sqlWarm = { ...sqlFixture.counts }
    const visits = await Promise.all(Array.from({ length: 20 }, () => read()))
    assert.ok(visits.every(view => view.cacheStatus === 'HIT'))
    assert.deepEqual(counts, initial)
    assert.deepEqual(sqlFixture.counts, sqlWarm)
    record('durable-warm-no-origin-work', {
      visits: visits.length,
      counts: { ...counts },
      sql: { ...sqlFixture.counts }
    })
    state.version = 2
    const queued = await Promise.all(
      Array.from({ length: 10 }, () => invalidate('/'))
    )
    assert.ok(queued.every(status => status === 200))
    assert.deepEqual(counts, initial)
    assert.equal((await read()).data.featured.id, 'ordinary-v1')
    assert.equal((await processBatch()).status, 'idle')
    setClock(initialTime + 1800000)
    const workers = await Promise.all(
      Array.from({ length: 20 }, () => processBatch())
    )
    assert.equal(
      workers.filter(result => result.status === 'updated').length,
      1
    )
    assert.ok(
      workers.every(
        result => result.status === 'updated' || result.status === 'idle'
      )
    )
    record('durable-admitted-batch', { workers: workers.length, updated: 1 })
    record('durable-new-cached-html', await waitForVersion(2))
    assert.equal(counts.taxonomies, 2)
    assert.equal(counts.modules, 2)
    const healthy = { ...counts }
    state.version = 3
    state.mode = 'modules-fail'
    await invalidate('/')
    setClock(initialTime + 3600000)
    await processBatch(503)
    const failed = { ...counts }
    assert.equal(failed.modules, healthy.modules + 1)
    assert.equal((await read()).data.featured.id, 'ordinary-v2')
    await processBatch()
    assert.deepEqual(
      counts,
      failed,
      'no CMS retry per visitor/processor in the same window'
    )
    state.mode = 'healthy'
    setClock(initialTime + 5400000)
    await processBatch()
    record('durable-recovered-cached-html', await waitForVersion(3))
    assert.equal(counts.modules, failed.modules + 1)
    const recovered = { ...counts }
    await stop()
    await start()
    const restarted = await read()
    assert.equal(restarted.data.featured.id, 'ordinary-v3')
    assert.equal(restarted.cacheStatus, 'HIT')
    assert.deepEqual(counts, recovered)
    record('durable-restart-hit', {
      counts: { ...counts },
      sql: { ...sqlFixture.counts }
    })
  } else if (snapshotScenario) {
    const probe = async () => {
      const response = await fetch(`${url}/api/editorial-probe`, {
        signal: AbortSignal.timeout(timeoutMs)
      })
      assert.equal(response.status, 200)
      assert.match(response.headers.get('cache-control') ?? '', /no-store/)
      const data = await response.json()
      return {
        data: {
          featured: data.featured?.id,
          sections: Object.fromEntries(
            Object.entries(data.sections).map(([id, posts]) => [
              id,
              posts.map(post => post.id)
            ])
          ),
          errors: data.errors
        },
        counts: { ...counts }
      }
    }
    const initial = await read()
    assert.equal(initial.cacheStatus, 'HIT')
    record('snapshot-before-midnight', await probe())
    assert.equal(checks.at(-1).data.featured, 'dated')
    assert.deepEqual(checks.at(-1).data.errors, [])
    const warmCounts = { ...counts }
    state.mode = 'modules-fail'
    setClock(deadline + 1000)
    record('snapshot-midnight-cms-outage', await probe())
    assert.deepEqual(
      checks.at(-1).data.errors,
      [],
      'midnight must reuse the healthy snapshot while the CMS is unavailable'
    )
    assert.equal(checks.at(-1).data.featured, 'ordinary')
    for (const articles of Object.values(checks.at(-1).data.sections))
      assert.ok(articles.every(id => id === 'ordinary'))
    assert.deepEqual(counts, warmCounts, 'calendar change adds no CMS query')
    await stop()
    await start()
    record('snapshot-midnight-persisted-after-restart', await probe())
    assert.equal(checks.at(-1).data.featured, 'ordinary')
    assert.deepEqual(checks.at(-1).data.errors, [])
    assert.deepEqual(counts, warmCounts, 'snapshot survives a process restart')
  } else if (deadlineScenario) {
    await new Promise((ok, no) => {
      const browser = spawn(
        process.execPath,
        [
          resolve(root, 'node_modules/@playwright/test/cli.js'),
          'test',
          'e2e/home-v2-deadline.spec.ts',
          '--project=chromium',
          '--workers=1',
          '--retries=0',
          '--reporter=line',
          `--output=${resolve(base, 'browser')}`
        ],
        {
          cwd: root,
          env: {
            ...env,
            NODE_OPTIONS: '',
            E2E_BASE_URL: url,
            HOME_V2_DEADLINE_E2E: deadlineScenario,
            HOME_V2_DEADLINE_CLOCK_URL: `http://127.0.0.1:${wpPort}/__fixture/clock`
          },
          stdio: 'inherit'
        }
      )
      browser.once('error', no)
      browser.once('exit', code =>
        code === 0 ? ok() : no(Error(`Deadline browser gate failed: ${code}`))
      )
    })
    record('editorial-deadline-visible-replacement', { counts: { ...counts } })
  } else if (releaseMode) {
    const manifest = JSON.parse(
      readFileSync(resolve(app, '.next/prerender-manifest.json'), 'utf8')
    )
    assert.equal(
      manifest.routes['/'].initialRevalidateSeconds,
      releaseMode === 'enabled' ? 300 : 7200
    )
    const expected = releaseMode === 'enabled' ? 'v2' : 'legacy'
    record('public-built-hit', await read())
    assert.equal(checks.at(-1).data.variant, expected)
    assert.equal(checks.at(-1).cacheStatus, 'HIT')
    const warmCounts = { ...counts }
    for (const path of [
      '/',
      '/?__ncol_home_audit=control&__ncol_home_measurement=1',
      '/?__ncol_home_audit=v2'
    ]) {
      record('public-warm-query-independent', await read(path))
      assert.equal(checks.at(-1).data.variant, expected)
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
    }
    const flight = await fetch(`${url}/?_rsc=local-cache-test`, {
      headers: { RSC: '1', Cookie: 'home_variant=control' }
    })
    assert.equal(flight.status, 200)
    assert.match(flight.headers.get('content-type'), /text\/x-component/)
    assert.ok((await flight.text()).includes(expected))
    assert.equal(flight.headers.get('x-nextjs-cache'), 'HIT')
    assert.deepEqual(
      counts,
      warmCounts,
      'HTML/RSC visits must not query WordPress'
    )
    record('public-rsc-hit', { counts: { ...counts } })
    assert.equal(await invalidate('/', 'wrong'), 401)
    assert.equal((await read()).data.variant, expected)
    assert.deepEqual(counts, warmCounts)
    record('public-unauthorized-invalidation', { counts: { ...counts } })
    if (releaseMode === 'enabled') {
      assert.equal(checks[0].data.featured.id, 'p1')
      assert.equal(counts.taxonomies, 1)
      assert.equal(counts.modules, 1)
      // Advance only the age of this isolated build's HTML. No system clock,
      // application TTL or live deployment changes; real Next handles expiry.
      const expireHtml = (clearData = true) => {
        let aged = 0
        const age = new Date(Date.now() - 301_000)
        const visit = directory => {
          for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = resolve(directory, entry.name)
            if (entry.isDirectory()) visit(path)
            else if (
              entry.name.endsWith('.html') &&
              readFileSync(path, 'utf8').includes('<pre id="data">')
            ) {
              const metaPath = path.replace(/\.html$/, '.meta')
              const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
              meta.routeCacheLastModified = age.getTime()
              writeFileSync(metaPath, JSON.stringify(meta))
              utimesSync(path, age, age)
              aged++
            }
          }
        }
        visit(resolve(app, '.next/server'))
        assert.ok(
          aged > 0,
          'must age the rendered root, including any scoped cache copy'
        )
        if (clearData)
          rmSync(resolve(app, '.next/cache/fetch-cache'), {
            recursive: true,
            force: true
          })
      }
      const waitFor = async check => {
        for (let i = 0; i < 150; i++) {
          if (await check()) return
          await new Promise(r => setTimeout(r, 200))
        }
        assert.fail('ISR background work did not finish in 30 seconds')
      }
      await stop()
      expireHtml()
      state.mode = 'modules-fail'
      await start()
      record('public-stale-during-outage', await read())
      assert.equal(checks.at(-1).cacheStatus, 'STALE')
      assert.equal(checks.at(-1).data.featured.id, 'p1')
      await waitFor(() =>
        readFileSync(resolve(base, 'server.log'), 'utf8').includes(
          'Home V2 editorial data unavailable'
        )
      )
      const outageCounts = { ...counts }
      record('public-retains-healthy-html', await read())
      assert.equal(checks.at(-1).data.featured.id, 'p1')
      assert.deepEqual(checks.at(-1).data.errors, [])
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
      assert.deepEqual(
        counts,
        outageCounts,
        'failed regeneration must not retry on each visit'
      )
      await stop()
      expireHtml()
      state.mode = 'healthy'
      state.version = 2
      await start()
      record('public-stale-before-recovery', await read())
      await waitFor(async () => (await read()).data.featured?.id === 'p2')
      record('public-recovered-hit', await read())
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
      assert.equal(checks.at(-1).data.featured.id, 'p2')
      const invalidatePublication = async () => {
        const r = await fetch(
          `${url}/api/revalidate?${new URLSearchParams({
            secret: 'local-cache-fixture-only',
            paths: JSON.stringify([
              '/',
              '/categoria/nacionales/',
              '/2026/10/23/publicacion/',
              '/etiqueta/politica/'
            ])
          })}`
        )
        assert.equal(r.status, 200)
      }
      const isEditorialSnapshot = (value, id) =>
        Number.isFinite(value?.fetchedAt) &&
        value.data?.errors?.length === 0 &&
        Array.isArray(value.data?.sections?.opening) &&
        value.data.sections.opening.some(article => article.id === id)
      const savedArticle = id =>
        readdirSync(resolve(app, '.next/cache/fetch-cache')).some(file => {
          try {
            const saved = JSON.parse(
              readFileSync(
                resolve(app, '.next/cache/fetch-cache', file),
                'utf8'
              )
            )
            return isEditorialSnapshot(
              JSON.parse(saved.data?.body ?? 'null'),
              id
            )
          } catch {
            return false
          }
        })
      state.version = 3
      const beforeCategory = { ...counts }
      assert.equal(await invalidate('/categoria/nacionales/'), 200)
      record('public-category-isolated', await read())
      assert.equal(checks.at(-1).data.featured.id, 'p2')
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
      assert.deepEqual(
        counts,
        beforeCategory,
        'category invalidation must not purge public Home data or HTML'
      )
      await invalidatePublication()
      record('public-publication-stale', await read())
      assert.equal(checks.at(-1).data.featured.id, 'p2')
      await waitFor(() => savedArticle('p3'))
      // The data and full-route caches both use SWR. Recompose the HTML at its
      // existing deadline without forcing another CMS query or changing TTLs.
      const beforeCompose = { ...counts }
      await stop()
      expireHtml(false)
      await start()
      await read()
      await waitFor(async () => {
        const value = await read()
        return value.data.featured?.id === 'p3' && value.cacheStatus === 'HIT'
      })
      record('public-publication-propagated', await read())
      assert.deepEqual(counts, beforeCompose)
      for (const mode of ['modules-fail', 'partial-error']) {
        state.mode = mode
        state.version = 4
        const beforeFailure = { ...counts }
        await invalidatePublication()
        const visits = await Promise.all(
          Array.from({ length: 10 }, () => read())
        )
        for (const visit of visits) {
          assert.equal(visit.data.featured.id, 'p3')
          assert.deepEqual(visit.data.errors, [])
        }
        await waitFor(
          async () =>
            (await read()).cacheStatus === 'HIT' &&
            counts.modules > beforeFailure.modules
        )
        const afterFailure = { ...counts }
        await Promise.all(Array.from({ length: 10 }, () => read()))
        assert.deepEqual(
          counts,
          afterFailure,
          'a failed publication refresh must not query WordPress on each visit'
        )
        assert.equal(
          counts.modules - beforeFailure.modules,
          1,
          'concurrent visitors share one refresh'
        )
        record(`public-publication-retains-${mode}`, {
          data: visits[0].data,
          counts: { ...counts },
          visits: 20
        })
      }
      state.mode = 'healthy'
      state.version = 4
      await invalidatePublication()
      await read()
      await waitFor(() => savedArticle('p4'))
      const beforeRecoveryCompose = { ...counts }
      await stop()
      expireHtml(false)
      await start()
      await read()
      await waitFor(async () => {
        const value = await read()
        return value.data.featured?.id === 'p4' && value.cacheStatus === 'HIT'
      })
      record('public-publication-recovered-hit', await read())
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
      assert.deepEqual(counts, beforeRecoveryCompose)
      const beforeRegion = { ...counts }
      const regionResponse = await fetch(`${url}/api/region`)
      assert.equal(regionResponse.status, 200)
      const regionData = await regionResponse.json()
      assert.equal(regionData.ok, true)
      assert.equal(regionData.articles[0]?.id, 'r4')
      assert.equal(counts.taxonomies, beforeRegion.taxonomies)
      assert.equal(counts.modules, beforeRegion.modules + 1)
      const regionWarm = { ...counts }
      await fetch(`${url}/api/region`).then(response => response.json())
      assert.deepEqual(counts, regionWarm)
      record('public-region-reuses-snapshot', {
        data: regionData,
        counts: { ...counts }
      })
      const day = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date())
      const beforePublicGet = { ...counts }
      const publicRegionUrl = `${url}/api/home-v2/region/${day}/zulia`
      const firstRegion = await fetch(publicRegionUrl, {
        headers: { Cookie: 'qa_reader=one' }
      })
      assert.equal(firstRegion.status, 200)
      assert.equal(
        firstRegion.headers.get('cache-control'),
        'public, max-age=0, must-revalidate'
      )
      assert.match(
        firstRegion.headers.get('cdn-cache-control') ?? '',
        /s-maxage=\d+, stale-while-revalidate=0/
      )
      assert.equal(firstRegion.headers.has('set-cookie'), false)
      const firstRegionData = await firstRegion.json()
      assert.equal(firstRegionData.editorialDay, day)
      assert.equal(firstRegionData.articles[0]?.id, 'r4')
      assert.ok(firstRegionData.cacheUntil <= Date.now() + 300000)
      const secondRegion = await fetch(publicRegionUrl, {
        headers: { Cookie: 'qa_reader=two' }
      })
      assert.deepEqual(await secondRegion.json(), firstRegionData)
      assert.deepEqual(
        counts,
        beforePublicGet,
        'public GET reuses the same regional snapshot without extending its freshness'
      )
      const oldRegion = await fetch(
        `${url}/api/home-v2/region/2000-01-01/zulia`
      )
      assert.equal(oldRegion.status, 410)
      assert.equal(oldRegion.headers.get('cache-control'), 'no-store')
      record('public-region-get-cache-contract', {
        data: firstRegionData,
        counts: { ...counts }
      })
      // A regional read needs taxonomy, not every editorial module. Age only
      // this fixture's Home snapshot and remove its regional cache entry.
      await stop()
      let agedEditorial = 0
      let removedRegional = 0
      const fetchCache = resolve(app, '.next/cache/fetch-cache')
      const age = new Date(Date.now() - 301000)
      for (const name of readdirSync(fetchCache)) {
        const path = resolve(fetchCache, name)
        const entry = JSON.parse(readFileSync(path, 'utf8'))
        let value
        try {
          value = JSON.parse(entry.data?.body ?? 'null')
        } catch {
          continue
        }
        if (isEditorialSnapshot(value, 'p4')) {
          utimesSync(path, age, age)
          agedEditorial++
        } else if (Array.isArray(value?.articles) && value.fetchedAt) {
          rmSync(path)
          removedRegional++
        }
      }
      assert.equal(agedEditorial, 1)
      assert.equal(removedRegional, 1)
      await start()
      const beforeIsolatedRegion = { ...counts }
      const isolatedRegion = await fetch(publicRegionUrl)
      assert.equal(isolatedRegion.status, 200)
      assert.equal((await isolatedRegion.json()).articles[0]?.id, 'r4')
      assert.equal(counts.taxonomies, beforeIsolatedRegion.taxonomies)
      assert.equal(
        counts.modules,
        beforeIsolatedRegion.modules + 1,
        'a cold regional read must not refresh the expired full Home snapshot'
      )
      const isolatedWarm = { ...counts }
      await fetch(publicRegionUrl)
      assert.deepEqual(counts, isolatedWarm)
      record('public-region-independent-from-editorial-expiry', {
        counts: { ...counts }
      })
    } else {
      const disabled = await fetch(`${url}/api/home-v2/region/2026-10-23/zulia`)
      assert.equal(disabled.status, 404)
      assert.equal(disabled.headers.get('cache-control'), 'no-store')
      assert.deepEqual(counts, {
        taxonomies: 0,
        modules: 0,
        control: 0,
        opinion: 0,
        photos: 0
      })
    }
  } else {
    record('outage', await read())
    assert.ok(checks.at(-1).data.errors.includes('opening'))
    state.mode = 'healthy'
    const taxonomyBeforeRecovery = counts.taxonomies
    record('recovery', await read())
    assert.equal(
      counts.taxonomies,
      taxonomyBeforeRecovery,
      'retries of editorial data must reuse healthy taxonomy cache'
    )
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
    const opinion = async () => {
      const response = await fetch(`${url}/api/opinion/authors`)
      return {
        status: response.status,
        cacheControl: response.headers.get('cache-control'),
        data: await response.json(),
        counts: { ...counts }
      }
    }
    record('opinion-cold', await opinion())
    assert.equal(checks.at(-1).status, 200)
    assert.equal(checks.at(-1).data.length, 6)
    assert.equal(checks.at(-1).counts.photos, 6)
    assert.match(checks.at(-1).cacheControl, /public.*s-maxage=1800/)
    record('opinion-warm', await opinion())
    assert.equal(
      checks.at(-1).counts.photos,
      6,
      'cached portraits eliminate repeated photo fanout'
    )
    state.mode = 'opinion-fail'
    record('opinion-outage', await opinion())
    assert.equal(checks.at(-1).status, 503)
    assert.equal(checks.at(-1).cacheControl, 'no-store')
    state.mode = 'healthy'
    record('opinion-recovery', await opinion())
    assert.equal(checks.at(-1).status, 200)
    assert.equal(checks.at(-1).data.length, 6)
  }
  const files = [
    ...(durableScenario
      ? [
          'src/lib/api/HomeSnapshotClient.ts',
          'src/lib/db/turso.ts',
          'src/lib/db/tursoSchema.ts',
          'src/lib/turso.ts',
          'src/lib/homeV2/publicSnapshot.ts',
          'src/lib/homeV2/publicCachePolicy.ts',
          'src/lib/homeV2/publicHomeLifetime.ts',
          'src/app/api/home-v2/refresh/route.ts',
          'src/app/api/home-v2/snapshot/route.ts'
        ]
      : []),
    ...(releaseMode
      ? [
          'src/app/page.tsx',
          'src/components/HomeV2/PublicHome.tsx',
          'src/lib/homeV2/release.ts'
        ]
      : []),
    'src/lib/api/BaseClient.ts',
    'src/lib/api/CategoriesClient.ts',
    'src/lib/api/PostsClient.ts',
    'src/lib/homeV2/types.ts',
    'src/lib/homeV2/loadHomeV2Data.ts',
    'src/lib/homeV2/getHomeV2Data.ts',
    'src/components/HomeV2/DailyBoundary.tsx',
    'src/components/HomeV2/EditorialViews.tsx',
    'src/lib/homeV2/editorialEditions.ts',
    'src/lib/homeV2/editorialPolicy.ts',
    'src/app/actions/getHomeV2Region.ts',
    'src/lib/homeV2/getHomeV2RegionData.ts',
    'src/app/api/home-v2/region/[day]/[region]/route.ts',
    'src/app/api/revalidate/route.ts',
    'src/app/actions/getFeaturedPost/index.ts',
    'src/app/actions/fetchAPI.ts',
    'src/app/actions/getOpinionAuthors/index.ts',
    'src/app/api/opinion/authors/route.ts'
  ]
  writeFileSync(
    resolve(base, 'result.json'),
    JSON.stringify(
      {
        source: execFileSync('git', ['rev-parse', 'HEAD'], {
          encoding: 'utf8'
        }).trim(),
        releaseMode,
        sourceHashes: Object.fromEntries(
          files.map(file => [
            file,
            createHash('sha256')
              .update(
                sourceOverrides.get(file)?.original ??
                  readFileSync(resolve(source, file))
              )
              .digest('hex')
          ])
        ),
        sourceOverrides: [...sourceOverrides].map(([file, { reason }]) => ({
          file,
          reason,
          fixtureHash: createHash('sha256')
            .update(readFileSync(resolve(source, file)))
            .digest('hex')
        })),
        checks
      },
      null,
      2
    )
  )
  console.log('ALL CACHE CHECKS PASSED')
} finally {
  if (deadlineScenario)
    console.log('editorial-deadline-final-cms-queries', JSON.stringify(counts))
  await stop()
  await new Promise(r => fixture.close(r))
  await sqlFixture?.close()
}
