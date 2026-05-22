#!/usr/bin/env node
/**
 * Clears all hypotheses (browser IndexedDB). Journal and timeline are kept.
 *
 * Requires the dev server so the app can run on the same origin as MondayDB.
 *
 * Usage:
 *   npm run clear-hypotheses
 *   npm run clear-hypotheses -- --port 5174
 *
 * Manual (browser console while the app is open):
 *   await clearMondayHypotheses()
 */

import { spawn } from 'node:child_process'

const DEFAULT_PORTS = [5173, 5174, 5175, 5176, 5177]
const HOSTS = ['localhost', '127.0.0.1']

function parsePort() {
  const idx = process.argv.indexOf('--port')
  if (idx !== -1 && process.argv[idx + 1]) {
    const p = Number(process.argv[idx + 1])
    if (Number.isFinite(p) && p > 0) return p
  }
  const envPort = Number(process.env.PORT)
  if (Number.isFinite(envPort) && envPort > 0) return envPort
  return null
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

async function main() {
  const preferredPort = parsePort()
  const server = await findDevServer(preferredPort)

  if (!server) {
    const portHint = preferredPort ?? DEFAULT_PORTS.join(', ')
    console.error('Dev server is not reachable.')
    console.error(`Tried http://localhost:{${portHint}}/ (and 127.0.0.1).`)
    console.error('')
    console.error('Start it in another terminal, then run this script again:')
    console.error('  npm run dev')
    console.error('  npm run clear-hypotheses')
    process.exit(1)
  }

  const clearUrl = `http://${server.host}:${server.port}/?clearHypotheses=1&confirm=1`

  console.log('Opening the app to clear all hypotheses…')
  console.log(clearUrl)
  openUrl(clearUrl)

  console.log('')
  console.log('Dismiss the summary alert in your browser when it opens.')
  console.log('Removes hypotheses only. Journal entries and timeline are kept.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
