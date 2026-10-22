import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(
  new URL('./sync-development-branch.sh', import.meta.url)
)

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'ncol-git-flow-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const remote = join(directory, 'remote.git')
  const cwd = join(directory, 'work')
  const git = (...args) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  execFileSync('git', ['init', '--bare', '--initial-branch=main', remote], {
    stdio: 'ignore'
  })
  execFileSync('git', ['clone', remote, cwd], { stdio: 'ignore' })
  git('config', 'user.name', 'Git flow test')
  git('config', 'user.email', 'git-flow@example.test')
  const commit = text => {
    writeFileSync(join(cwd, 'article.txt'), text)
    git('add', 'article.txt')
    git('commit', '-m', text)
    return git('rev-parse', 'HEAD')
  }
  commit('initial')
  git('push', 'origin', 'main')
  git('checkout', '-b', 'develop')
  const head = commit('released')
  git('push', 'origin', 'develop')
  git('checkout', 'main')
  git('merge', '--squash', 'develop')
  git('commit', '-m', 'release')
  const release = git('rev-parse', 'HEAD')
  git('push', 'origin', 'main')
  const sync = () =>
    spawnSync('bash', [script, release, head, '123'], { cwd, encoding: 'utf8' })
  return { directory, remote, cwd, git, commit, sync, head, release }
}

test('sync records main ancestry, preserves content and is idempotent', t => {
  const { git, sync, release } = fixture(t)
  const tree = git('rev-parse', 'origin/develop^{tree}')
  const result = sync()
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('rev-parse', 'origin/develop^{tree}'), tree)
  git('merge-base', '--is-ancestor', release, 'origin/develop')
  assert.equal(
    git('rev-list', '--parents', '-n', '1', 'origin/develop').split(' ').length,
    3
  )
  const tip = git('rev-parse', 'origin/develop')
  assert.equal(sync().status, 0)
  assert.equal(git('rev-parse', 'origin/develop'), tip)
})

test('new develop edits and open feature ancestry survive synchronization', t => {
  const { git, commit, sync, release } = fixture(t)
  git('checkout', 'develop')
  const newHead = commit('new edit to the same released line')
  git('push', 'origin', 'develop')
  git('branch', 'feature-in-progress')
  const tree = git('rev-parse', 'develop^{tree}')
  const result = sync()
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('rev-parse', 'origin/develop^{tree}'), tree)
  assert.equal(git('rev-parse', 'feature-in-progress'), newHead)
  git('merge-base', '--is-ancestor', newHead, 'origin/develop')
  git('merge-base', '--is-ancestor', release, 'origin/develop')
})

test('a concurrent push is preserved when synchronization retries', t => {
  const { directory, remote, cwd, git, sync, release } = fixture(t)
  const racer = join(directory, 'racer')
  execFileSync('git', ['clone', '--branch', 'develop', remote, racer], {
    stdio: 'ignore'
  })
  const raceGit = (...args) =>
    execFileSync('git', args, {
      cwd: racer,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  raceGit('config', 'user.name', 'Concurrent author')
  raceGit('config', 'user.email', 'race@example.test')
  writeFileSync(join(racer, 'article.txt'), 'concurrent edit')
  raceGit('add', 'article.txt')
  raceGit('commit', '-m', 'concurrent edit')
  const concurrent = raceGit('rev-parse', 'HEAD')
  const hook = join(cwd, '.git', 'hooks', 'pre-push')
  writeFileSync(
    hook,
    `#!/bin/sh\nrm -- "$0"\ngit -C "${racer}" push origin develop\n`
  )
  chmodSync(hook, 0o700)
  const result = sync()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /Push rejected \(attempt 1\)/)
  assert.equal(git('show', 'origin/develop:article.txt'), 'concurrent edit')
  git('merge-base', '--is-ancestor', concurrent, 'origin/develop')
  git('merge-base', '--is-ancestor', release, 'origin/develop')
})

test('main changes absent from the release are rejected without updating develop', t => {
  const { cwd, git, commit, head } = fixture(t)
  const changedRelease = commit('unexpected production-only edit')
  git('push', 'origin', 'main')
  const tip = git('rev-parse', 'origin/develop')
  const result = spawnSync('bash', [script, changedRelease, head, '123'], {
    cwd,
    encoding: 'utf8'
  })
  assert.notEqual(result.status, 0)
  assert.equal(git('rev-parse', 'origin/develop'), tip)
})

test('release head outside develop is rejected without updating develop', t => {
  const { cwd, git, commit, release } = fixture(t)
  git('checkout', '-b', 'unmerged-feature', 'develop')
  const unmerged = commit('unmerged feature')
  const tip = git('rev-parse', 'origin/develop')
  const result = spawnSync('bash', [script, release, unmerged, '123'], {
    cwd,
    encoding: 'utf8'
  })
  assert.notEqual(result.status, 0)
  assert.equal(git('rev-parse', 'origin/develop'), tip)
})
