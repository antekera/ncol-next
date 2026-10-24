const { spawn } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const { readFileSync, writeFileSync, renameSync } = require('node:fs')

if (
  process.env.HOME_V2_PUBLIC_ENABLED !== 'true' ||
  process.env.HOME_V2_DURABLE_CACHE_ENABLED !== 'true'
) {
  console.log('Home snapshot prewarm skipped: public durable Home is disabled')
} else if (!process.argv.includes('--worker')) {
  // A separate process owns every connection, including existing CMS clients.
  // Killing it cancels real I/O rather than abandoning a Promise.race loser.
  const child = spawn(
    process.execPath,
    [__filename, '--worker', ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: process.env
    }
  )
  let timedOut = false
  let force
  const terminate = signal => {
    child.kill(signal)
    force ??= setTimeout(() => child.kill('SIGKILL'), 2000)
  }
  process.once('SIGTERM', () => terminate('SIGTERM'))
  process.once('SIGINT', () => terminate('SIGINT'))
  const timer = setTimeout(() => {
    timedOut = true
    console.error('Home snapshot prewarm timed out')
    terminate('SIGTERM')
  }, 30000)
  child.on('error', () => {
    clearTimeout(timer)
    process.exitCode = 1
  })
  child.on('exit', code => {
    clearTimeout(timer)
    clearTimeout(force)
    process.exitCode = timedOut ? 1 : (code ?? 1)
  })
} else {
  ;(async () => {
    require('ts-node').register({
      transpileOnly: true,
      compilerOptions: {
        module: 'CommonJS',
        moduleResolution: 'node',
        allowJs: false
      }
    })
    const paths = require('tsconfig-paths')
    const config = paths.loadConfig(process.cwd())
    if (config.resultType !== 'success')
      throw new Error('Home prewarm paths unavailable')
    paths.register({ baseUrl: config.absoluteBaseUrl, paths: config.paths })

    const target =
      process.env.HOME_V2_CACHE_BUILD_ENV ||
      (process.env.VERCEL === '1' ? process.env.VERCEL_ENV : undefined)
    if (
      (process.env.VERCEL === '1' && !target) ||
      (target && !['production', 'preview'].includes(target)) ||
      (process.env.VERCEL === '1' &&
        process.env.VERCEL_ENV &&
        target !== process.env.VERCEL_ENV)
    )
      throw new Error('Home prewarm target mismatch')
    const path = require.resolve('@lib/generated/homeCacheIdentity.json')
    const identity = JSON.parse(readFileSync(path, 'utf8'))
    if (
      process.argv.includes('--new-build') ||
      identity.environment !== (target ?? null) ||
      (target === 'preview' && !identity.previewBuildId)
    ) {
      const next = {
        environment: target ?? null,
        previewBuildId: target === 'preview' ? randomUUID() : null
      }
      const temporary = `${path}.${process.pid}.tmp`
      writeFileSync(temporary, JSON.stringify(next, null, 2) + '\n')
      renameSync(temporary, path)
    }
    const {
      prewarmPublicHomeSnapshot
    } = require('@lib/homeV2/prewarmPublicHomeSnapshot')
    const result = await prewarmPublicHomeSnapshot()
    console.log(`Home snapshot prewarm: ${result.status} (${result.scope})`)
  })().then(
    () => process.exit(0),
    () => {
      // Provider errors may contain connection details: do not dump them into
      // build artifacts. Existing CMS error reporting retains its own policy.
      console.error(
        'Home snapshot prewarm failed; verify build target, CMS and storage'
      )
      process.exit(1)
    }
  )
}
