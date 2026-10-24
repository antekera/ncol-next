import assert from 'node:assert/strict'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
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
    containerVersionId: '33',
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
function generate(input = base, publishedVersion = '33', options = []) {
  const dir = mkdtempSync(join(tmpdir(), 'home-gtm-'))
  try {
    const source = join(dir, 'source.json')
    const target = join(dir, 'draft.json')
    const original = JSON.stringify(input)
    writeFileSync(source, original)
    const result = spawnSync(
      process.execPath,
      [script.pathname, source, target, publishedVersion, ...options],
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

function historySource() {
  const input = structuredClone(base)
  input.containerVersion.tag.push({
    tagId: '8',
    name: 'G4 ANALYTICS',
    type: 'googtag',
    fingerprint: 'old',
    parameter: [
      parameter('tagId', '{{G4-constant}}'),
      {
        type: 'LIST',
        key: 'configSettingsTable',
        list: [
          {
            type: 'MAP',
            map: [
              parameter('parameter', 'send_page_view'),
              parameter('parameterValue', 'true')
            ]
          }
        ]
      }
    ],
    firingTriggerId: ['2147479553', '21'],
    tagFiringOption: 'ONCE_PER_EVENT',
    consentSettings: { consentStatus: 'NOT_SET' }
  })
  input.containerVersion.trigger.push({
    triggerId: '21',
    name: 'HISTORY_TRIGGER',
    type: 'HISTORY_CHANGE'
  })
  return input
}

test('explicit GA4 history ownership changes only the Google tag history firing trigger', () => {
  const input = historySource()
  const previous = input.containerVersion.tag.find(t => t.tagId === '8')
  assert.deepEqual(
    generate(input).containerVersion.tag.find(t => t.tagId === '8'),
    previous
  )
  const draft = generate(input, '33', ['--history-owner=ga4']).containerVersion
  const expected = structuredClone(previous)
  expected.firingTriggerId = ['2147479553']
  delete expected.fingerprint
  assert.deepEqual(
    draft.tag.find(t => t.tagId === '8'),
    expected
  )
  assert.deepEqual(
    draft.trigger.slice(0, input.containerVersion.trigger.length),
    input.containerVersion.trigger
  )
})

test('GA4 history ownership rejects changed source configuration before writing an artifact', () => {
  for (const mutate of [
    v => {
      v.tag = v.tag.filter(t => t.tagId !== '8')
    },
    v => {
      v.tag.find(t => t.tagId === '8').parameter[0].value = 'G-OTHER'
    },
    v => {
      v.tag.find(t => t.tagId === '8').firingTriggerId.push('11')
    },
    v => {
      v.tag.find(t => t.tagId === '8').parameter[1].list[0].map[1].value =
        'false'
    },
    v => {
      v.trigger.find(t => t.triggerId === '21').type = 'CUSTOM_EVENT'
    }
  ]) {
    const input = historySource()
    mutate(input.containerVersion)
    const dir = mkdtempSync(join(tmpdir(), 'home-gtm-history-'))
    try {
      const source = join(dir, 'source.json')
      const target = join(dir, 'draft.json')
      const original = JSON.stringify(input)
      writeFileSync(source, original)
      const result = spawnSync(
        process.execPath,
        [script.pathname, source, target, '33', '--history-owner=ga4'],
        { encoding: 'utf8' }
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /history.*configuration/i)
      assert.equal(existsSync(target), false)
      assert.equal(readFileSync(source, 'utf8'), original)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }
})
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
    assert.equal(pairs(current).home_version, '{{Home V2 - home_version}}')
    assert.equal(pairs(current).experiment_id, undefined)
    assert.equal(pairs(current).home_variant, undefined)
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
    assert.equal(trigger.filter.length, 1)
    assert(
      trigger.filter.some(f =>
        f.parameter.some(p => p.value === '{{Home V2 - home_version}}')
      )
    )
    assert(
      trigger.filter.some(f =>
        f.parameter.some(p => p.value === '^(current|v2)$')
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
      v.variable.push({ variableId: '999', name: 'Home V2 - home_version' })
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
        [script.pathname, source, target, '33'],
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
      [script.pathname, source, target, '33'],
      { encoding: 'utf8' }
    )
    assert.notEqual(existing.status, 0)
    assert.equal(readFileSync(target, 'utf8'), 'keep user artifact')
    const freshTarget = join(dir, 'unconfirmed.json')
    for (const args of [
      [],
      [source, freshTarget],
      [source, freshTarget, 'latest']
    ]) {
      const absent = spawnSync(process.execPath, [script.pathname, ...args], {
        encoding: 'utf8'
      })
      assert.notEqual(absent.status, 0)
      assert.match(absent.stderr, /usage/i)
      assert.equal(existsSync(freshTarget), false)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('labels a newly confirmed version accurately and preserves unrelated paused tags', () => {
  const input = structuredClone(base)
  input.containerVersion.containerVersionId = '34'
  const paused = {
    tagId: '53',
    name: 'Existing paused tag',
    type: 'html',
    paused: true,
    parameter: [parameter('html', '<!-- Existing configuration -->')]
  }
  input.containerVersion.tag.push(paused)
  const draft = generate(input, '34').containerVersion
  assert.equal(draft.name, 'Home V2 - UNPUBLISHED draft based on v34')
  assert.deepEqual(
    draft.tag.find(tag => tag.tagId === '53'),
    paused
  )
})

test('rejects an older or unversioned export against the confirmed published version without creating a draft', () => {
  for (const version of ['32', undefined]) {
    const dir = mkdtempSync(join(tmpdir(), 'home-gtm-stale-'))
    try {
      const source = join(dir, 'source.json')
      const target = join(dir, 'draft.json')
      const input = structuredClone(base)
      input.containerVersion.containerVersionId = version
      const original = JSON.stringify(input)
      writeFileSync(source, original)
      const result = spawnSync(
        process.execPath,
        [script.pathname, source, target, '33'],
        { encoding: 'utf8' }
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /confirmed published version/i)
      assert.equal(existsSync(target), false)
      assert.equal(readFileSync(source, 'utf8'), original)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }
})
