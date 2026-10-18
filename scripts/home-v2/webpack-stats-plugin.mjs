import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Build-only evidence. No source code, runtime hooks or emitted assets change.
export class HomeV2WebpackStatsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('HomeV2WebpackStats', stats => {
      const directory = resolve('.superpowers/sdd/2026-10-17-home-v2/bundles')
      mkdirSync(directory, { recursive: true })
      const filename = resolve(directory, `client-${Date.now()}.json`)
      writeFileSync(
        filename,
        JSON.stringify(
          stats.toJson({
            all: false,
            hash: true,
            assets: true,
            chunks: true,
            modules: true,
            nestedModules: true,
            reasons: true,
            entrypoints: true,
            ids: true,
            source: false,
            modulesSpace: Infinity,
            nestedModulesSpace: Infinity
          })
        ),
        { flag: 'wx' }
      )
      console.log(`[Home V2 bundle audit] ${filename}`)
    })
  }
}
