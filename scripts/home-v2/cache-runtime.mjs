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
  utimesSync
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
assert.ok(
  args.length === 2 ||
    (args.length === 3 &&
      ['--public=enabled', '--public=disabled'].includes(args[2]))
)
const releaseMode = args[2]?.split('=')[1]
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
  `export default {outputFileTracingRoot:${JSON.stringify(root)},typescript:{ignoreBuildErrors:true},experimental:{externalDir:true},webpack(config){config.resolve.alias['@lib']=${JSON.stringify(resolve(source, 'src/lib'))};config.resolve.alias['@components']=${JSON.stringify(resolve(app, 'fixtures'))};config.resolve.alias['@app']=${JSON.stringify(resolve(source, 'src/app'))};return config}}`
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
    readFileSync(resolve(source, 'src/app/page.tsx'), 'utf8')
  )
  save(
    'fixtures/Header.tsx',
    'export function Header(){return <header>NoticiasCol</header>}'
  )
  save(
    'fixtures/LegacyHome.tsx',
    `export default function LegacyHome(){return <pre id="data">{JSON.stringify({variant:'legacy'})}</pre>}`
  )
  save(
    'fixtures/HomeV2.tsx',
    `export function HomeV2({data}){return <pre id="data">{JSON.stringify({variant:'v2',featured:data.featured,errors:data.errors})}</pre>}`
  )
}
save(
  'app/api/revalidate/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/revalidate/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
save(
  'app/api/region/route.ts',
  `import {getHomeV2Region} from ${JSON.stringify(resolve(source, 'src/app/actions/getHomeV2Region'))}; export const dynamic='force-dynamic'; export async function GET(){return Response.json(await getHomeV2Region('zulia'))}`
)
save(
  'app/api/opinion/authors/route.ts',
  `import {GET as handler} from ${JSON.stringify(resolve(source, 'src/app/api/opinion/authors/route'))}; export const dynamic='force-dynamic'; export const GET=handler`
)
let state = { version: 1, mode: releaseMode ? 'healthy' : 'modules-fail' },
  counts = { taxonomies: 0, modules: 0, control: 0, opinion: 0, photos: 0 }
const checks = []
const releaseGaps = []
const fixture = createServer(async (req, res) => {
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
        nodes: [
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
const env = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  HOME_V2_PREVIEW_ENABLED: 'true',
  ...(releaseMode
    ? {
        HOME_V2_PUBLIC_ENABLED: String(releaseMode === 'enabled'),
        VERCEL: '1',
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
    await new Promise(r => child.once('exit', r))
  }
}
try {
  await run(['build', '--webpack'], 'build.log')
  await start()
  const read = async (path = '/') => {
    const r = await fetch(`${url}${path}`, {
      signal: AbortSignal.timeout(30_000)
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
  if (releaseMode) {
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
      const expireHtml = () => {
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
      state.version = 3
      assert.equal(await invalidate('/'), 200)
      record('public-authorized-invalidation', await read())
      assert.equal(checks.at(-1).data.featured.id, 'p3')
      record('public-warm-after-invalidation', await read())
      assert.equal(checks.at(-1).cacheStatus, 'HIT')
      assert.deepEqual(counts, checks.at(-2).counts)
      // Diagnose the existing publisher's hard purge separately from timed ISR.
      // A 500 here is a launch gap, never approval of production availability.
      state.mode = 'modules-fail'
      state.version = 4
      assert.equal(await invalidate('/'), 200)
      const failed = await fetch(url)
      const failedBody = await failed.text()
      assert.ok(
        !failedBody.includes('Noticia 4'),
        'must not cache partial output'
      )
      const beforeRepeatedVisit = { ...counts }
      const repeated = await fetch(url)
      await repeated.text()
      if (failed.status !== 200 || repeated.status !== 200) {
        releaseGaps.push(
          'hard-purge-outage: last healthy HTML is unavailable; retries may query CMS per visit'
        )
      }
      record('public-hard-purge-outage-diagnostic', {
        status: failed.status,
        repeatedStatus: repeated.status,
        additionalModuleQueries: counts.modules - beforeRepeatedVisit.modules
      })
      state.mode = 'healthy'
      record('public-hard-purge-recovery', await read())
      assert.equal(checks.at(-1).data.featured.id, 'p4')
    } else {
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
    'src/app/actions/getHomeV2Region.ts',
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
        releaseGaps,
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
  console.log(
    releaseGaps.length
      ? 'CACHE CHECKS PASSED; PUBLIC LAUNCH GAPS REMAIN'
      : 'ALL CACHE CHECKS PASSED'
  )
} finally {
  await stop()
  await new Promise(r => fixture.close(r))
}
