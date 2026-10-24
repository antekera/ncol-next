import { readFileSync, writeFileSync } from 'node:fs'

// Offline configuration authoring only. No network, credentials or publishing.
const home = [
  'home_version',
  'home_view_id',
  'opening_treatment',
  'module_id',
  'component_type'
]
const editorial = [
  ...home,
  'editorial_position',
  'item_position',
  'article_id',
  'section_id'
]
const clicks = [
  ...editorial,
  'region_id',
  'service_id',
  'direction',
  'video_provider',
  'video_id',
  'from_item_position',
  'to_item_position',
  'navigation_method'
]
const reading = [
  ...editorial,
  'origin_article_id',
  'first_article_id',
  'active_reading_seconds'
]
const vitals = [
  ...home,
  'web_vital_name',
  'web_vital_value',
  'web_vital_delta',
  'web_vital_id',
  'web_vital_revision',
  'web_vital_unit',
  'web_vital_rating',
  'web_vital_navigation',
  'web_vital_scope',
  'web_vital_environment',
  'lcp_element_role'
]
const families = [
  {
    name: 'Impressions',
    events: ['MODULE_IMPRESSION', 'CARD_IMPRESSION'],
    fields: [...editorial, 'visibility_rule']
  },
  {
    name: 'Video',
    events: ['PLAY_VIDEO', 'CLICK_POST_LINK', 'CLICK_VIEW_NEWS'],
    fields: [...editorial, 'video_provider', 'video_id']
  },
  {
    name: 'Reading',
    events: [
      'ARTICLE_DESTINATION_OPEN',
      'SECOND_ARTICLE_OPEN',
      'ARTICLE_ENGAGEMENT'
    ],
    fields: reading
  },
  { name: 'Web Vitals', events: ['WEB_VITAL'], fields: vitals }
]
const variableName = field => `Home V2 - ${field}`
const reference = field => `{{${variableName(field)}}}`
const parameter = (key, value) => ({ type: 'TEMPLATE', key, value })
const fieldRow = (key, value) => ({
  type: 'MAP',
  map: [parameter('parameter', key), parameter('parameterValue', value)]
})
const condition = (type, variable, value) => ({
  type,
  parameter: [parameter('arg0', variable), parameter('arg1', value)]
})
const contextRows = fields =>
  fields.map(field => fieldRow(field, reference(field)))
const eventRows = fields => [
  fieldRow('LABEL', '{{label}}'),
  fieldRow('CATEGORY', '{{category}}'),
  fieldRow('ACTION', '{{Event}}'),
  fieldRow('non_interaction', reference('non_interaction')),
  ...contextRows(fields)
]
const table = rows => ({ type: 'LIST', key: 'eventSettingsTable', list: rows })

function verifySource(version, publishedVersion) {
  if (version?.container?.publicId !== 'GTM-KSDFW3')
    throw new Error('Expected the existing NoticiasCol container GTM-KSDFW3')
  if (String(version.containerVersionId) !== publishedVersion)
    throw new Error(
      'Export does not match the confirmed published version; export and review the current container'
    )
  if (
    ['tag', 'trigger', 'variable'].some(kind =>
      version[kind]?.some(item => item.name.startsWith('Home V2 -'))
    )
  )
    throw new Error(
      'Source already contains a Home V2 draft; re-export and review conflicts'
    )
  const measurement = version.variable?.find(v => v.name === 'G4-constant')
  if (
    !measurement?.parameter.some(
      p => p.key === 'value' && p.value === 'G-JJB0ZF28R1'
    )
  )
    throw new Error(
      'The existing measurement destination changed; review the container'
    )
  for (const [id, name] of [
    ['20', 'CUSTOM_PAGE_VIEW'],
    ['28', 'CLICK_EVENT']
  ]) {
    const tag = version.tag?.find(tag => tag.tagId === id && tag.name === name)
    if (
      !tag ||
      tag.type !== 'gaawe' ||
      !tag.parameter.some(
        p => p.key === 'measurementIdOverride' && p.value === '{{G4-constant}}'
      )
    )
      throw new Error(
        `The existing ${name} tag changed; review the container before generating`
      )
  }
}

function enrich(tag, fields) {
  const settings = tag.parameter.find(p => p.key === 'eventSettingsTable')
  if (!settings?.list)
    throw new Error(`Missing legacy event settings: ${tag.name}`)
  settings.list.push(...contextRows(fields))
  // GTM recomputes this on import; never assert a stale fingerprint for edits.
  delete tag.fingerprint
}

function buildGtmDraft(source, publishedVersion) {
  verifySource(source?.containerVersion, publishedVersion)
  const draft = structuredClone(source)
  const version = draft.containerVersion
  const identity = {
    accountId: version.accountId,
    containerId: version.containerId
  }
  let nextId = Math.max(
    ...['tag', 'trigger', 'variable'].flatMap(kind =>
      version[kind].map(item => Number(item[`${kind}Id`]))
    )
  )
  const id = () => String(++nextId)
  const fields = new Set([
    ...clicks,
    ...reading,
    ...vitals,
    'visibility_rule',
    'non_interaction'
  ])
  for (const field of fields) {
    version.variable.push({
      ...identity,
      variableId: id(),
      name: variableName(field),
      type: 'v',
      parameter: [
        { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
        { type: 'BOOLEAN', key: 'setDefaultValue', value: 'false' },
        parameter('name', field)
      ],
      formatValue: {}
    })
  }
  enrich(
    version.tag.find(tag => tag.tagId === '20'),
    home
  )
  enrich(
    version.tag.find(tag => tag.tagId === '28'),
    clicks
  )
  for (const family of families) {
    const triggerId = id()
    version.trigger.push({
      ...identity,
      triggerId,
      name: `Home V2 - ${family.name}`,
      type: 'CUSTOM_EVENT',
      customEventFilter: [
        condition('MATCH_REGEX', '{{_event}}', `^(${family.events.join('|')})$`)
      ],
      filter: [
        condition('MATCH_REGEX', reference('home_version'), '^(current|v2)$')
      ]
    })
    version.tag.push({
      ...identity,
      tagId: id(),
      name: `Home V2 - ${family.name}`,
      type: 'gaawe',
      paused: true,
      notes:
        'UNPUBLISHED draft. Keep paused until policy, Preview and GA4 validation. Direct release only; no A/B assignment.',
      parameter: [
        { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' },
        table(eventRows(family.fields)),
        parameter('eventName', '{{Event}}'),
        parameter('measurementIdOverride', '{{G4-constant}}')
      ],
      firingTriggerId: [triggerId],
      tagFiringOption: 'ONCE_PER_EVENT',
      monitoringMetadata: { type: 'MAP' },
      consentSettings: {
        consentStatus: 'NEEDED',
        consentType: {
          type: 'LIST',
          list: [{ type: 'TEMPLATE', value: 'analytics_storage' }]
        }
      }
    })
  }
  version.name = `Home V2 - UNPUBLISHED draft based on v${publishedVersion}`
  version.description =
    'Local draft only: enrich existing events and add paused Home measurement tags. No Google tag, container, transport or public experiment is added.'
  return draft
}

const [sourcePath, targetPath, publishedVersion] = process.argv.slice(2)
if (
  !sourcePath ||
  !targetPath ||
  !/^[1-9]\d*$/.test(publishedVersion ?? '') ||
  process.argv.length !== 5
)
  throw new Error(
    'Usage: node scripts/home-v2/gtm-draft.mjs source.json draft.json confirmed-published-version'
  )
{
  const draft = buildGtmDraft(
    JSON.parse(readFileSync(sourcePath, 'utf8')),
    publishedVersion
  )
  writeFileSync(targetPath, `${JSON.stringify(draft, null, 2)}\n`, {
    flag: 'wx'
  })
}
