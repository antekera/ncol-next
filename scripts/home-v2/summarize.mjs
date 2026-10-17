// node scripts/home-v2/summarize.mjs INPUT_DIR OUTPUT_JSON COMMIT VARIANT
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'

const [input, output, commit, variant] = process.argv.slice(2)
if (!input || !output || !commit || !variant)
  throw new Error(
    'Provide input directory, new output JSON, commit and variant'
  )
if (existsSync(output)) throw new Error('Refusing to overwrite prior evidence')
const rows = JSON.parse(readFileSync(join(input, 'runs.json'), 'utf8'))
const names = new Set(rows.map(row => row.name))
if (rows.length !== 20 || names.size !== 20)
  throw new Error('A complete matrix must contain 20 distinct reports')
const metrics = [
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'first-contentful-paint',
  'speed-index',
  'total-byte-weight',
  'bootup-time',
  'mainthread-work-breakdown'
]
const aggregate = values => {
  if (values.some(value => !Number.isFinite(value)))
    throw new Error('A required numeric measurement is missing')
  const sorted = values.toSorted((a, b) => a - b)
  return {
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted.at(-1)
  }
}
const local = resource =>
  ['localhost', '127.0.0.1'].includes(new URL(resource.url).hostname)
const total = resources =>
  resources.reduce((sum, resource) => sum + (resource.transferSize ?? 0), 0)
const networkMetrics = row => {
  const scripts = row.network.filter(
    resource => resource.resourceType === 'Script'
  )
  const images = row.network.filter(
    resource => resource.resourceType === 'Image'
  )
  const document = row.network.find(
    resource => resource.resourceType === 'Document' && local(resource)
  )
  if (!document) throw new Error(`Main document missing: ${row.name}`)
  return {
    requests: row.network.length,
    image_requests: images.length,
    image_transfer_bytes: total(images),
    script_transfer_bytes: total(scripts),
    first_party_script_transfer_bytes: total(scripts.filter(local)),
    document_transfer_bytes: document.transferSize,
    document_decoded_bytes: document.resourceSize,
    browser_wordpress_requests: row.network.filter(
      resource => new URL(resource.url).hostname === 'admin.noticiascol.com'
    ).length
  }
}
function diagnostic(row) {
  const path = join(input, `${row.name}.json.gz`)
  if (!existsSync(path))
    return { name: row.name, details: 'Raw report unavailable' }
  const report = JSON.parse(gunzipSync(readFileSync(path)))
  const insight = report.audits['lcp-breakdown-insight']?.details?.items ?? []
  return {
    name: row.name,
    // Insight timings are observed trace values, not simulated headline LCP.
    observed_lcp_breakdown: insight
      .filter(item => item.type === 'table')
      .flatMap(item =>
        item.items.map(({ subpart, duration }) => ({
          subpart,
          duration_ms: duration
        }))
      ),
    lcp_elements: insight
      .filter(item => item.type === 'node')
      .map(item => ({ selector: item.selector, rect: item.boundingRect })),
    layout_shifts: (report.audits['layout-shifts']?.details?.items ?? []).map(
      item => ({
        selector: item.node?.selector,
        score: item.score,
        causes: (item.subItems?.items ?? [])
          .map(child => child.cause)
          .filter(Boolean)
      })
    )
  }
}
const groups = []
for (const device of ['mobile', 'desktop']) {
  for (const cache of ['cold', 'warm']) {
    const group = rows.filter(
      row => row.device === device && row.cache === cache
    )
    if (
      group.length !== 5 ||
      new Set(group.map(row => row.iteration)).size !== 5
    )
      throw new Error(
        `Expected five independent repetitions for ${device}/${cache}`
      )
    const network = group.map(networkMetrics)
    groups.push({
      device,
      browser_cache: cache,
      count: group.length,
      score: aggregate(group.map(row => row.score)),
      metrics: Object.fromEntries(
        metrics.map(key => [key, aggregate(group.map(row => row.metrics[key]))])
      ),
      resources: Object.fromEntries(
        Object.keys(network[0]).map(key => [
          key,
          aggregate(network.map(entry => entry[key]))
        ])
      ),
      settings: {
        formFactor: group[0].settings.formFactor,
        screenEmulation: group[0].settings.screenEmulation,
        throttlingMethod: group[0].settings.throttlingMethod,
        throttling: group[0].settings.throttling,
        blockedUrlPatterns: group[0].settings.blockedUrlPatterns
      },
      browser: group[0].environment.networkUserAgent,
      cpu_benchmark_index: aggregate(
        group.map(row => row.environment.benchmarkIndex)
      ),
      warnings: [...new Set(group.flatMap(row => row.warnings ?? []))]
    })
  }
}
const summary = {
  kind: 'lab',
  stage: 'diagnostic-requires-budget-review',
  commit,
  variant,
  node: [...new Set(rows.map(row => row.node))],
  lighthouse: [...new Set(rows.map(row => row.lighthouseVersion))],
  runs: rows.length,
  start: rows[0].date,
  end: rows.at(-1).date,
  field_cwv: {
    status: 'not_available',
    p75: null,
    note: 'Laboratory results are not field CWV; no V2 field sample while experiment remains disabled.'
  },
  groups,
  diagnostics: rows.map(diagnostic)
}
mkdirSync(dirname(resolve(output)), { recursive: true })
writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`)
console.log(
  JSON.stringify({
    output,
    groups: groups.map(group => ({
      device: group.device,
      cache: group.browser_cache,
      lcp: group.metrics['largest-contentful-paint'].median,
      cls: group.metrics['cumulative-layout-shift'].median,
      tbt: group.metrics['total-blocking-time'].median
    }))
  })
)
