import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

// Synthetic export: these tests do not need an account backup or generated reports.
const parameter = (key, value) => ({ type: 'TEMPLATE', key, value })
const legacyTag = (tagId, name) => ({
  tagId,
  name,
  type: 'gaawe',
  firingTriggerId: ['11'],
  parameter: [
    parameter('measurementIdOverride', '{{G4-constant}}'),
    parameter('eventName', '{{Event}}'),
    {
      type: 'LIST',
      key: 'eventSettingsTable',
      list: ['label', 'category'].map(field => ({
        type: 'MAP',
        map: [
          parameter('parameter', field.toUpperCase()),
          parameter('parameterValue', `{{${field}}}`)
        ]
      }))
    }
  ]
})
const base = {
  containerVersion: {
    accountId: 'test-account',
    containerId: 'test-container',
    container: { publicId: 'GTM-KSDFW3' },
    tag: [
      {
        tagId: '1',
        name: 'Google tag fixture',
        type: 'googtag',
        parameter: [parameter('tagId', '{{G4-constant}}')]
      },
      legacyTag('20', 'CUSTOM_PAGE_VIEW'),
      legacyTag('28', 'CLICK_EVENT')
    ],
    trigger: [
      { triggerId: '11', name: 'Existing trigger', type: 'CUSTOM_EVENT' }
    ],
    variable: [
      {
        variableId: '30',
        name: 'G4-constant',
        type: 'c',
        parameter: [parameter('value', 'G-JJB0ZF28R1')]
      },
      ...['label', 'category'].map((name, index) => ({
        variableId: String(31 + index),
        name,
        type: 'v',
        parameter: [parameter('name', name)]
      }))
    ],
    builtInVariable: [{ type: 'EVENT', name: 'Event' }]
  }
}
const script = new URL('./gtm-draft.mjs', import.meta.url)
function generate(input = base) {
  const dir = mkdtempSync(join(tmpdir(), 'home-gtm-'))
  try {
    const source = join(dir, 'source.json')
    const target = join(dir, 'draft.json')
    const original = JSON.stringify(input)
    writeFileSync(source, original)
    const result = spawnSync(
      process.execPath,
      [script.pathname, source, target],
      { encoding: 'utf8' }
    )
    assert.equal(result.status, 0, result.stderr)
    assert.equal(
      readFileSync(source, 'utf8'),
      original,
      'source export changed'
    )
    return JSON.parse(readFileSync(target, 'utf8'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
const table = tag =>
  tag.parameter.find(p => p.key === 'eventSettingsTable').list
const pairs = tag =>
  Object.fromEntries(
    table(tag).map(row => [
      row.map.find(p => p.key === 'parameter').value,
      row.map.find(p => p.key === 'parameterValue').value
    ])
  )

test('preserves every unrelated tag, trigger, variable and Google tag verbatim without changing the source export', () => {
  const draft = generate().containerVersion
  for (const kind of ['tag', 'trigger', 'variable', 'builtInVariable']) {
    for (const item of base.containerVersion[kind]) {
      if (kind === 'tag' && ['20', '28'].includes(item.tagId)) continue
      const id = kind === 'builtInVariable' ? 'type' : `${kind}Id`
      assert.deepEqual(
        draft[kind].find(candidate => candidate[id] === item[id]),
        item
      )
    }
  }
})

test('enriches the two legacy events in place and keeps their measurement reference, triggers and old parameters', () => {
  const draft = generate().containerVersion
  for (const id of ['20', '28']) {
    const previous = base.containerVersion.tag.find(t => t.tagId === id)
    const current = draft.tag.find(t => t.tagId === id)
    assert.deepEqual(current.firingTriggerId, previous.firingTriggerId)
    for (const [key, value] of Object.entries(pairs(previous)))
      assert.equal(pairs(current)[key], value)
    assert.equal(pairs(current).home_variant, '{{Home V2 - home_variant}}')
    assert.equal(
      current.parameter.find(p => p.key === 'measurementIdOverride').value,
      '{{G4-constant}}'
    )
    assert.equal(draft.tag.filter(t => t.name === previous.name).length, 1)
  }
})

test('adds paused native GA4 event tags with scoped exact event matching and no new Google tag, HTML or consent bypass', () => {
  const draft = generate().containerVersion
  const added = draft.tag.filter(
    t => !base.containerVersion.tag.some(old => old.tagId === t.tagId)
  )
  assert.equal(added.length, 4)
  const wanted = [
    'ARTICLE_DESTINATION_OPEN',
    'ARTICLE_ENGAGEMENT',
    'CARD_IMPRESSION',
    'CLICK_POST_LINK',
    'CLICK_VIEW_NEWS',
    'MODULE_IMPRESSION',
    'PLAY_VIDEO',
    'SECOND_ARTICLE_OPEN',
    'WEB_VITAL'
  ]
  const matched = []
  for (const tag of added) {
    assert.equal(tag.paused, true)
    assert.equal(tag.type, 'gaawe')
    assert.equal(
      tag.parameter.find(p => p.key === 'measurementIdOverride').value,
      '{{G4-constant}}'
    )
    assert.equal(
      tag.parameter.find(p => p.key === 'eventName').value,
      '{{Event}}'
    )
    assert.equal(tag.consentSettings.consentStatus, 'NEEDED')
    assert.deepEqual(
      tag.consentSettings.consentType.list.map(x => x.value),
      ['analytics_storage']
    )
    const trigger = draft.trigger.find(
      t => t.triggerId === tag.firingTriggerId[0]
    )
    const expression = trigger.customEventFilter[0].parameter.find(
      p => p.key === 'arg1'
    ).value
    const re = new RegExp(expression)
    matched.push(...wanted.filter(event => re.test(event)))
    assert.equal(re.test('CUSTOM_PAGE_VIEW'), false)
    assert.equal(re.test('CLICK_EVENT'), false)
    assert.equal(re.test('PREFIX_WEB_VITAL_SUFFIX'), false)
    assert(
      trigger.filter.some(f =>
        f.parameter.some(p => p.value === '{{Home V2 - experiment_id}}')
      )
    )
    assert(
      trigger.filter.some(f => f.parameter.some(p => p.value === 'home_v2'))
    )
    assert(
      trigger.filter.some(f =>
        f.parameter.some(p => p.value === '^(control|v2)$')
      )
    )
  }
  assert.deepEqual(matched.sort(), wanted)
})

test('fits each event family inside GA4 limits and retains the fields needed to interpret native vitals revisions and reading origins', () => {
  const draft = generate().containerVersion
  for (const tag of draft.tag.filter(
    t =>
      t.type === 'gaawe' &&
      (t.name.startsWith('Home V2 -') || ['20', '28'].includes(t.tagId))
  )) {
    const names = Object.keys(pairs(tag))
    assert(names.length <= 25, `${tag.name}: ${names.length}`)
    assert.equal(names.length, table(tag).length)
  }
  const vitals = pairs(draft.tag.find(t => t.name === 'Home V2 - Web Vitals'))
  for (const field of [
    'web_vital_value',
    'web_vital_id',
    'web_vital_revision',
    'web_vital_delta',
    'web_vital_scope',
    'web_vital_environment',
    'lcp_element_role',
    'opening_treatment'
  ])
    assert.equal(vitals[field], `{{Home V2 - ${field}}}`)
  const reading = pairs(draft.tag.find(t => t.name === 'Home V2 - Reading'))
  for (const field of [
    'origin_article_id',
    'first_article_id',
    'active_reading_seconds'
  ])
    assert.equal(reading[field], `{{Home V2 - ${field}}}`)
})

test('uses version-2 dataLayer variables without defaults, unique IDs and references that resolve in the existing container', () => {
  const draft = generate().containerVersion
  const ids = []
  for (const kind of ['tag', 'trigger', 'variable']) {
    for (const item of draft[kind]) ids.push(item[`${kind}Id`])
  }
  assert.equal(new Set(ids).size, ids.length)
  const names = new Set([
    ...draft.variable.map(v => v.name),
    ...draft.builtInVariable.map(v => v.name),
    '_event'
  ])
  for (const item of [...draft.tag, ...draft.trigger]) {
    for (const match of JSON.stringify(item).matchAll(/\{\{([^}]+)\}\}/g))
      assert(names.has(match[1]), match[1])
  }
  for (const v of draft.variable.filter(v => v.name.startsWith('Home V2 -'))) {
    assert.equal(v.type, 'v')
    assert.equal(v.parameter.find(p => p.key === 'dataLayerVersion').value, '2')
    assert.equal(
      v.parameter.find(p => p.key === 'setDefaultValue').value,
      'false'
    )
  }
})

test('rejects the wrong container and repeated drafts before creating a misleading artifact', () => {
  for (const mutate of [
    v => {
      v.container.publicId = 'GTM-OTHER'
    },
    v => {
      v.tag.push({ tagId: '999', name: 'Home V2 - Reading' })
    },
    v => {
      v.variable.find(x => x.name === 'G4-constant').parameter[0].value =
        'G-OTHER'
    },
    v => {
      v.variable.push({ variableId: '999', name: 'Home V2 - home_variant' })
    },
    v => {
      v.trigger.push({ triggerId: '999', name: 'Home V2 - Web Vitals' })
    }
  ]) {
    const input = structuredClone(base)
    mutate(input.containerVersion)
    const dir = mkdtempSync(join(tmpdir(), 'home-gtm-reject-'))
    try {
      const source = join(dir, 'source.json')
      const target = join(dir, 'draft.json')
      writeFileSync(source, JSON.stringify(input))
      const result = spawnSync(
        process.execPath,
        [script.pathname, source, target],
        { encoding: 'utf8' }
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /container|draft|measurement/i)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }
})

test('refuses to overwrite an existing artifact and reports missing CLI arguments', () => {
  const dir = mkdtempSync(join(tmpdir(), 'home-gtm-cli-'))
  try {
    const source = join(dir, 'source.json')
    const target = join(dir, 'draft.json')
    writeFileSync(source, JSON.stringify(base))
    writeFileSync(target, 'keep user artifact')
    const existing = spawnSync(
      process.execPath,
      [script.pathname, source, target],
      { encoding: 'utf8' }
    )
    assert.notEqual(existing.status, 0)
    assert.equal(readFileSync(target, 'utf8'), 'keep user artifact')
    const absent = spawnSync(process.execPath, [script.pathname], {
      encoding: 'utf8'
    })
    assert.notEqual(absent.status, 0)
    assert.match(absent.stderr, /usage/i)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
