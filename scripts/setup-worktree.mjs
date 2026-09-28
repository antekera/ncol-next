import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync
} from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

function pathExists(path) {
  try {
    lstatSync(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

function linkSharedFile(source, destination) {
  if (!existsSync(source)) return 'missing'

  if (pathExists(destination)) {
    if (lstatSync(destination).isSymbolicLink()) {
      if (realpathSync(destination) === realpathSync(source)) return 'linked'
    }
    throw new Error(
      `${destination} already exists and does not point to ${source}; refusing to replace it.`
    )
  }

  symlinkSync(relative(dirname(destination), source), destination, 'file')
  return 'linked'
}

function getDependencyCacheRoot() {
  const cacheHome =
    process.env.XDG_CACHE_HOME ||
    (process.platform === 'darwin'
      ? join(homedir(), 'Library', 'Caches')
      : join(homedir(), '.cache'))
  return join(cacheHome, 'ncol-next', 'worktree-node-modules')
}

function getLockHash(lockfilePath) {
  return createHash('sha256').update(readFileSync(lockfilePath)).digest('hex')
}

function installDependencies(stagingDirectory) {
  const npmCliPath = process.env.npm_execpath
  if (!npmCliPath) {
    throw new Error(
      'Run this setup through npm (for example, npm run worktree:setup).'
    )
  }
  execFileSync(process.execPath, [npmCliPath, 'ci', '--legacy-peer-deps'], {
    cwd: stagingDirectory,
    stdio: 'inherit'
  })
}

function ensureCachedDependencies({ worktreeRoot, cacheRoot, install }) {
  const lockfile = join(worktreeRoot, 'package-lock.json')
  if (!existsSync(lockfile)) {
    throw new Error(`Cannot share dependencies because ${lockfile} is missing.`)
  }

  const lockHash = getLockHash(lockfile)
  const cacheDirectory = join(cacheRoot, lockHash)
  const modulesPath = join(cacheDirectory, 'node_modules')

  if (!existsSync(modulesPath)) {
    if (pathExists(cacheDirectory)) {
      throw new Error(
        `The shared dependency cache for lock ${lockHash.slice(0, 12)} is incomplete: ${cacheDirectory}`
      )
    }

    mkdirSync(dirname(cacheDirectory), { recursive: true })
    const stagingDirectory = mkdtempSync(
      join(dirname(cacheDirectory), `.install-${lockHash.slice(0, 12)}-`)
    )
    try {
      copyFileSync(
        join(worktreeRoot, 'package.json'),
        join(stagingDirectory, 'package.json')
      )
      copyFileSync(lockfile, join(stagingDirectory, 'package-lock.json'))
      install(stagingDirectory)
      renameSync(stagingDirectory, cacheDirectory)
    } catch (error) {
      rmSync(stagingDirectory, { recursive: true, force: true })
      if (existsSync(modulesPath)) return { cacheDirectory, modulesPath }
      throw error
    }
  }

  return { cacheDirectory, modulesPath }
}

export function setupWorktree({
  primaryRoot,
  worktreeRoot,
  cacheRoot = getDependencyCacheRoot(),
  install = installDependencies
}) {
  const primaryPath = realpathSync(primaryRoot)
  const worktreePath = realpathSync(worktreeRoot)
  if (primaryPath === worktreePath) {
    return { isWorktree: false, sharedDependencies: false }
  }

  for (const name of ['.env', '.env.local']) {
    linkSharedFile(join(primaryPath, name), join(worktreePath, name))
  }

  const dependencies = ensureCachedDependencies({
    worktreeRoot: worktreePath,
    cacheRoot,
    install
  })
  linkSharedFile(dependencies.modulesPath, join(worktreePath, 'node_modules'))

  return {
    isWorktree: true,
    sharedDependencies: true,
    dependenciesPath: dependencies.modulesPath
  }
}

function findGitRoot(startPath) {
  let candidate = resolve(startPath)

  while (true) {
    const gitMarker = join(candidate, '.git')
    if (existsSync(gitMarker)) {
      if (lstatSync(gitMarker).isDirectory()) {
        return { worktreeRoot: candidate, commonGitDirectory: gitMarker }
      }

      const gitPointerLine = readFileSync(gitMarker, 'utf8')
        .split(/\r?\n/)
        .find(line => line.startsWith('gitdir: '))
      const gitPointer = gitPointerLine?.slice('gitdir: '.length)
      if (gitPointer) {
        const worktreeGitDirectory = resolve(candidate, gitPointer)
        const commonDirectoryFile = join(worktreeGitDirectory, 'commondir')
        if (existsSync(commonDirectoryFile)) {
          return {
            worktreeRoot: candidate,
            commonGitDirectory: resolve(
              worktreeGitDirectory,
              readFileSync(commonDirectoryFile, 'utf8').trim()
            )
          }
        }
      }
      throw new Error(
        `Could not resolve the common Git directory for ${candidate}.`
      )
    }

    const parent = dirname(candidate)
    if (parent === candidate) break
    candidate = parent
  }

  throw new Error(`Could not find a Git worktree above ${startPath}.`)
}

function run() {
  const targetIndex = process.argv.indexOf('--target')
  if (targetIndex !== -1 && !process.argv[targetIndex + 1]) {
    throw new Error(
      'Usage: node scripts/setup-worktree.mjs [--target <worktree-path>]'
    )
  }
  const { worktreeRoot, commonGitDirectory } = findGitRoot(
    targetIndex === -1
      ? process.cwd()
      : resolve(process.cwd(), process.argv[targetIndex + 1])
  )
  const primaryRoot = dirname(commonGitDirectory)
  const result = setupWorktree({ primaryRoot, worktreeRoot })

  if (!result.isWorktree) {
    console.log(
      'Primary checkout detected; keeping its local environment and dependencies.'
    )
    return
  }

  console.log(
    `Linked shared environment files and dependencies at ${result.dependenciesPath}`
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  run()
}
