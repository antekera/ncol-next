import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, it } from 'node:test'
import { setupWorktree } from './setup-worktree.mjs'

const temporaryRoots = []

function createProject(root, { lock = '{}', env = {} } = {}) {
  mkdirSync(root, { recursive: true })
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'test-project' })
  )
  writeFileSync(join(root, 'package-lock.json'), lock)
  for (const [name, value] of Object.entries(env)) {
    writeFileSync(join(root, name), value)
  }
  return root
}

function createRoots(options) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'ncol-worktree-test-'))
  temporaryRoots.push(tempRoot)
  return {
    tempRoot,
    primaryRoot: createProject(join(tempRoot, 'primary'), options),
    worktreeRoot: createProject(join(tempRoot, 'worktree'), {
      lock: options?.lock
    }),
    cacheRoot: join(tempRoot, 'cache')
  }
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('setupWorktree', () => {
  it('shares environment files and installs dependencies into a lockfile-scoped cache', () => {
    const roots = createRoots({
      lock: '{"lockfileVersion":3}',
      env: { '.env': 'SECRET=value', '.env.local': 'LOCAL=value' }
    })
    let installationCount = 0

    const result = setupWorktree({
      ...roots,
      install: cacheDirectory => {
        installationCount += 1
        mkdirSync(join(cacheDirectory, 'node_modules'))
      }
    })

    assert.equal(
      realpathSync(join(roots.worktreeRoot, '.env')),
      realpathSync(join(roots.primaryRoot, '.env'))
    )
    assert.equal(
      realpathSync(join(roots.worktreeRoot, '.env.local')),
      realpathSync(join(roots.primaryRoot, '.env.local'))
    )
    assert.equal(
      realpathSync(join(roots.worktreeRoot, 'node_modules')),
      realpathSync(result.dependenciesPath)
    )
    assert.equal(installationCount, 1)
    assert.equal(result.sharedDependencies, true)
  })

  it('does not overwrite an existing worktree env file', () => {
    const roots = createRoots({ env: { '.env': 'PRIMARY=value' } })
    writeFileSync(join(roots.worktreeRoot, '.env'), 'WORKTREE=value')

    assert.throws(
      () =>
        setupWorktree({
          ...roots,
          install: cacheDirectory =>
            mkdirSync(join(cacheDirectory, 'node_modules'))
        }),
      /already exists/
    )
    assert.equal(
      readFileSync(join(roots.worktreeRoot, '.env'), 'utf8'),
      'WORKTREE=value'
    )
  })
})
