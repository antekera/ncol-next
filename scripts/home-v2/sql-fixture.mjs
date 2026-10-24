import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

// Local Hrana v2 transport for integration tests. The application uses its real
// HTTP SDK, Drizzle and SQL; no production token or database is accepted here.
export async function createHomeSqlFixture(root, output, { afterRead } = {}) {
  const url = `file:${resolve(output, 'editorial.sqlite')}`
  const setup = createClient({ url })
  await setup.executeMultiple(
    readFileSync(
      resolve(root, 'scripts/migrations/2026-10-23-home-v2-cache.sql'),
      'utf8'
    )
  )
  setup.close()
  const streams = new Map()
  const counts = { requests: 0, reads: 0, writes: 0, transactions: 0 }
  let available = true
  let writer
  let unlock
  let free = Promise.resolve()
  const acquire = async state => {
    while (writer && writer !== state) await free
    if (writer === state) return
    writer = state
    free = new Promise(resolve => {
      unlock = resolve
    })
  }
  const release = state => {
    if (writer !== state) return
    writer = undefined
    unlock()
  }
  const decode = value => {
    switch (value.type) {
      case 'null':
        return null
      case 'integer':
        return Number(value.value)
      case 'float':
        return value.value
      case 'text':
        return value.value
      case 'blob':
        return Buffer.from(value.base64, 'base64')
      default:
        throw Error(`Unsupported argument ${value.type}`)
    }
  }
  const encode = value => {
    if (value === null) return { type: 'null' }
    if (
      typeof value === 'bigint' ||
      (typeof value === 'number' && Number.isInteger(value))
    )
      return { type: 'integer', value: String(value) }
    if (typeof value === 'number') return { type: 'float', value }
    if (typeof value === 'string') return { type: 'text', value }
    return { type: 'blob', base64: Buffer.from(value).toString('base64') }
  }
  const execute = async (state, stmt) => {
    const query = stmt.sql ?? state.sql.get(stmt.sql_id)
    if (!query) throw Error('Missing SQL statement')
    const begin = /^\s*BEGIN/i.test(query)
    const end = /^\s*(COMMIT|ROLLBACK)\b/i.test(query)
    await acquire(state)
    try {
      let result
      if (begin) {
        if (!/^\s*BEGIN IMMEDIATE\b/i.test(query))
          throw Error('Expected primary write-mode transaction')
        state.tx = await state.client.transaction('write')
        state.transaction = true
        counts.transactions++
      } else if (end) {
        if (!state.tx) throw Error('No active transaction')
        if (/^\s*ROLLBACK/i.test(query)) await state.tx.rollback()
        else await state.tx.commit()
        state.tx = undefined
        state.transaction = false
      } else
        result = await (state.tx ?? state.client).execute({
          sql: query,
          args: (stmt.args ?? []).map(decode)
        })
      result ??= {
        columns: [],
        columnTypes: [],
        rows: [],
        rowsAffected: 0,
        lastInsertRowid: undefined
      }
      if (/^\s*select\b/i.test(query)) {
        counts.reads++
        await afterRead?.(query)
      }
      if (/^\s*(insert|update|delete)\b/i.test(query)) counts.writes++
      return {
        cols: result.columns.map((name, index) => ({
          name,
          decltype: result.columnTypes[index] ?? null
        })),
        rows: result.rows.map(row =>
          result.columns.map((_, index) => encode(row[index]))
        ),
        affected_row_count: result.rowsAffected,
        last_insert_rowid:
          result.lastInsertRowid === undefined
            ? null
            : String(result.lastInsertRowid)
      }
    } finally {
      if (!state.transaction) release(state)
    }
  }
  const server = createServer(async (req, res) => {
    if (req.method === 'GET') {
      res.writeHead(404)
      return res.end()
    }
    if (
      req.url !== '/v2/pipeline' ||
      req.headers.authorization !== 'Bearer local-sql-fixture'
    ) {
      res.writeHead(401)
      return res.end()
    }
    counts.requests++
    if (!available) {
      res.writeHead(503)
      return res.end('Local storage outage')
    }
    let state
    try {
      let body = ''
      for await (const chunk of req) body += chunk
      const input = JSON.parse(body)
      state = input.baton ? streams.get(input.baton) : undefined
      if (!state) {
        state = {
          id: randomUUID(),
          client: createClient({ url }),
          transaction: false,
          sql: new Map(),
          closed: false
        }
        streams.set(state.id, state)
      }
      const results = []
      for (const request of input.requests) {
        try {
          let response
          if (request.type === 'execute')
            response = {
              type: 'execute',
              result: await execute(state, request.stmt)
            }
          else if (request.type === 'batch') {
            const step_results = [],
              step_errors = []
            const matches = condition => {
              if (!condition) return true
              if (condition.type === 'ok')
                return step_results[condition.step] != null
              if (condition.type === 'error')
                return step_errors[condition.step] != null
              if (condition.type === 'not') return !matches(condition.cond)
              if (condition.type === 'and')
                return condition.conds.every(matches)
              if (condition.type === 'or') return condition.conds.some(matches)
              if (condition.type === 'is_autocommit') return !state.transaction
              throw Error(`Unsupported condition ${condition.type}`)
            }
            for (const step of request.batch.steps) {
              let result = null,
                error = null
              if (matches(step.condition)) {
                try {
                  result = await execute(state, step.stmt)
                } catch (failure) {
                  error = {
                    code: failure.code ?? 'SQLITE_ERROR',
                    message: failure.message
                  }
                }
              }
              step_results.push(result)
              step_errors.push(error)
            }
            response = { type: 'batch', result: { step_results, step_errors } }
          } else if (request.type === 'store_sql') {
            state.sql.set(request.sql_id, request.sql)
            response = { type: 'store_sql' }
          } else if (request.type === 'close_sql') {
            state.sql.delete(request.sql_id)
            response = { type: 'close_sql' }
          } else if (request.type === 'get_autocommit')
            response = {
              type: 'get_autocommit',
              is_autocommit: !state.transaction
            }
          else if (request.type === 'close') {
            state.tx?.close()
            state.client.close()
            state.closed = true
            streams.delete(state.id)
            release(state)
            response = { type: 'close' }
          } else throw Error(`Unsupported pipeline request ${request.type}`)
          results.push({ type: 'ok', response })
        } catch (error) {
          results.push({
            type: 'error',
            error: {
              code: error.code ?? 'SQLITE_ERROR',
              message: error.message
            }
          })
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          baton: state.closed ? null : state.id,
          base_url: null,
          results
        })
      )
    } catch (error) {
      if (state) {
        state.tx?.close()
        state.client.close()
        streams.delete(state.id)
        release(state)
      }
      res.writeHead(500)
      res.end(String(error))
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    counts,
    setAvailable(value) {
      available = value
    },
    async close() {
      for (const state of streams.values()) {
        state.tx?.close()
        state.client.close()
        release(state)
      }
      streams.clear()
      await new Promise(resolve => server.close(resolve))
    }
  }
}
