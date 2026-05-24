import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const SNAPSHOT_ROUTE = '/__monday/db-snapshot'

function snapshotsDir(root: string): string {
  return path.resolve(root, 'db-snapshots')
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function listSnapshotFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'manifest.json')
    .sort()
}

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(
  res: import('http').ServerResponse,
  status: number,
  payload: unknown
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function resolveSnapshotPath(dir: string, fileParam: string | null): string | null {
  if (!fileParam) {
    const files = listSnapshotFiles(dir)
    if (!files.length) return null
    return path.join(dir, files[files.length - 1]!)
  }

  const base = path.basename(fileParam)
  const resolved = path.resolve(dir, base)
  if (!resolved.startsWith(dir + path.sep) && resolved !== dir) {
    return null
  }
  return resolved
}

export function mondayDbSnapshotPlugin(): Plugin {
  let root = process.cwd()

  return {
    name: 'monday-db-snapshot',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const dir = snapshotsDir(root)
      ensureDir(dir)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(SNAPSHOT_ROUTE)) {
          next()
          return
        }

        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        try {
          if (req.method === 'GET' && pathname === `${SNAPSHOT_ROUTE}/list`) {
            const files = listSnapshotFiles(dir)
            sendJson(res, 200, { directory: dir, files })
            return
          }

          if (req.method === 'GET' && pathname === `${SNAPSHOT_ROUTE}/latest`) {
            const latestPath = resolveSnapshotPath(dir, null)
            if (!latestPath || !fs.existsSync(latestPath)) {
              sendJson(res, 404, { error: 'No snapshots found.' })
              return
            }
            const raw = fs.readFileSync(latestPath, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(raw)
            return
          }

          if (req.method === 'GET' && pathname.startsWith(`${SNAPSHOT_ROUTE}/file/`)) {
            const name = decodeURIComponent(pathname.slice(`${SNAPSHOT_ROUTE}/file/`.length))
            const filePath = resolveSnapshotPath(dir, name)
            if (!filePath || !fs.existsSync(filePath)) {
              sendJson(res, 404, { error: 'Snapshot file not found.' })
              return
            }
            const raw = fs.readFileSync(filePath, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(raw)
            return
          }

          if (req.method === 'POST' && pathname === SNAPSHOT_ROUTE) {
            const body = await readBody(req)
            const parsed = JSON.parse(body) as { exportedAt?: string }
            const stamp = (parsed.exportedAt ?? new Date().toISOString()).replace(
              /[:.]/g,
              '-'
            )
            const filename = `monday-db-${stamp}.json`
            const filePath = path.join(dir, filename)
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8')

            const manifest = {
              latest: filename,
              updatedAt: new Date().toISOString(),
              files: listSnapshotFiles(dir),
            }
            fs.writeFileSync(
              path.join(dir, 'manifest.json'),
              JSON.stringify(manifest, null, 2),
              'utf8'
            )

            sendJson(res, 200, {
              ok: true,
              path: filePath,
              filename,
            })
            return
          }

          sendJson(res, 404, { error: 'Unknown snapshot route.' })
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          sendJson(res, 500, { error: message })
        }
      })
    },
  }
}
