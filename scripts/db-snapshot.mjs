#!/usr/bin/env node
/**
 * Export or restore Monday IndexedDB via the dev server (browser storage).
 *
 * Snapshots are written under ./db-snapshots/ (gitignored).
 *
 * Usage:
 *   npm run db:snapshot              # export → db-snapshots/monday-db-<timestamp>.json
 *   npm run db:snapshot -- restore   # restore latest snapshot
 *   npm run db:snapshot -- restore --file monday-db-2025-11-24T12-00-00-000Z.json
 *   npm run db:snapshot -- list      # list snapshot files on disk
 *
 * Requires: npm run dev (same ports as clear-journal script).
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SNAPSHOTS_DIR = path.join(ROOT, 'db-snapshots')

const DEFAULT_PORTS = [5173, 5174, 5175, 5176, 5177]
const HOSTS = ['localhost', '127.0.0.1']

function parseArgs() {
  const argv = process.argv.slice(2)
  const action = argv[0] === 'restore' || argv[0] === 'list' ? argv[0] : 'export'
  let port = null
  let file = null

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port' && argv[i + 1]) port = Number(argv[i + 1])
    if (argv[i] === '--file' && argv[i + 1]) file = argv[i + 1]
  }

  return { action, port, file }
}

async function probe(host, port) {
  try {
    const res = await fetch(`http://${host}:${port}/`, {
      signal: AbortSignal.timeout(2500),
      redirect: 'follow',
    })
    return res.status >= 200 && res.status < 500
  } catch {
    return false
  }
}

async function findDevServer(preferredPort) {
  const ports = preferredPort ? [preferredPort] : DEFAULT_PORTS
  for (const port of ports) {
    for (const host of HOSTS) {
      if (await probe(host, port)) return { host, port }
    }
  }
  return null
}

function openUrl(url) {
  const platform = process.platform
  if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref()
    return
  }
  if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref()
    return
  }
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref()
}

function listLocalSnapshots() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    console.log('No db-snapshots folder yet.')
    return
  }
  const files = fs
    .readdirSync(SNAPSHOTS_DIR)
    .filter((n) => n.endsWith('.json') && n !== 'manifest.json')
    .sort()
  if (!files.length) {
    console.log('db-snapshots/ is empty.')
    return
  }
  console.log(`Snapshots in ${SNAPSHOTS_DIR}:`)
  for (const file of files) {
    const stat = fs.statSync(path.join(SNAPSHOTS_DIR, file))
    console.log(`  ${file}  (${Math.round(stat.size / 1024)} KB)`)
  }
}

async function main() {
  const { action, port: preferredPort, file } = parseArgs()

  if (action === 'list') {
    listLocalSnapshots()
    const server = await findDevServer(preferredPort)
    if (server) {
      const res = await fetch(
        `http://${server.host}:${server.port}/__monday/db-snapshot/list`
      )
      const data = await res.json()
      console.log('\nVia dev server:', data.files?.length ?? 0, 'file(s)')
    }
    return
  }

  const server = await findDevServer(preferredPort)
  if (!server) {
    console.error('Dev server is not reachable. Start it with: npm run dev')
    process.exit(1)
  }

  if (action === 'export') {
    const url = `http://${server.host}:${server.port}/?dbSnapshot=export&save=1&confirm=1`
    console.log('Exporting IndexedDB to db-snapshots/ …')
    console.log(url)
    openUrl(url)
    console.log('\nCheck the browser alert, then db-snapshots/ in this project.')
    return
  }

  if (action === 'restore') {
    const fileQuery = file ? `&file=${encodeURIComponent(file)}` : '&latest=1'
    const url = `http://${server.host}:${server.port}/?dbSnapshot=restore${fileQuery}&confirm=1`
    console.log('Restoring IndexedDB from snapshot …')
    console.log(url)
    openUrl(url)
    console.log('\nThe page will reload after restore.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
