import type { Plugin } from 'vite'
import { loadEnv } from 'vite'

const LLM_ROUTE_PREFIX = '/api/llm'

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

/**
 * Dev-only proxy: forwards /api/llm/* to an OpenAI-compatible API.
 * API key stays in .env.local (LLM_API_KEY) — never bundled into the client.
 */
export function mondayLlmProxyPlugin(): Plugin {
  return {
    name: 'monday-llm-proxy',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      const apiKey = env.LLM_API_KEY?.trim()
      const baseUrl = (
        env.LLM_API_URL?.trim() || 'https://api.openai.com/v1'
      ).replace(/\/$/, '')

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(LLM_ROUTE_PREFIX)) {
          next()
          return
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        if (!apiKey) {
          sendJson(res, 503, {
            error:
              'LLM_API_KEY is not set. Copy .env.example to .env.local and add your API key.',
          })
          return
        }

        try {
          const body = await readBody(req)
          const upstreamPath = req.url.slice(LLM_ROUTE_PREFIX.length) || '/'
          const target = `${baseUrl}${upstreamPath}`

          const upstream = await fetch(target, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body,
          })

          const text = await upstream.text()
          res.statusCode = upstream.status
          res.setHeader(
            'Content-Type',
            upstream.headers.get('content-type') ?? 'application/json'
          )
          res.end(text)
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          sendJson(res, 502, { error: message })
        }
      })
    },
  }
}
