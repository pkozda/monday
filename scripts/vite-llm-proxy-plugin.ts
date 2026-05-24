import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import {
  appendLlmTrafficLog,
  LLM_TRAFFIC_LOG_PATH,
  parseJsonSafe,
} from './llm-file-logger'

const LLM_ROUTE_PREFIX = '/api/llm'
const LLM_DEBUG_LOG_PATH = '/api/llm-debug-log'

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

      console.info(`[Monday LLM log] Writing LLM traffic to ${LLM_TRAFFIC_LOG_PATH}`)

      server.middlewares.use(async (req, res, next) => {
        if (req.url === LLM_DEBUG_LOG_PATH && req.method === 'POST') {
          try {
            const raw = await readBody(req)
            const entry = parseJsonSafe(raw)
            if (entry && typeof entry === 'object') {
              const record = entry as Record<string, unknown>
              appendLlmTrafficLog({
                direction: 'client-outbound',
                source: String(record.source ?? 'llmClient'),
                at: String(record.at ?? new Date().toISOString()),
                label: record.label,
                attempt: record.attempt,
                chatUrl: record.chatUrl,
                model: record.model,
                estimatedInputTokens: record.estimatedInputTokens,
                maxOutputTokens: record.maxOutputTokens,
                jsonMode: record.jsonMode,
                body: record.body,
                bodyBytes: record.bodyBytes,
              })
            }
            res.statusCode = 204
            res.end()
          } catch {
            sendJson(res, 400, { error: 'Invalid log payload' })
          }
          return
        }

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

          appendLlmTrafficLog({
            direction: 'outbound',
            source: 'vite-proxy',
            at: new Date().toISOString(),
            upstreamUrl: target,
            requestPath: req.url,
            requestBody: parseJsonSafe(body),
            requestBodyBytes: Buffer.byteLength(body, 'utf8'),
          })

          const upstream = await fetch(target, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body,
          })

          const text = await upstream.text()
          let responseBody: unknown = parseJsonSafe(text)
          if (
            typeof responseBody === 'object' &&
            responseBody !== null &&
            text.length > 12_000
          ) {
            const choices = (responseBody as { choices?: unknown }).choices
            responseBody = {
              _truncated: true,
              status: upstream.status,
              originalBytes: text.length,
              choicesPreview: choices,
            }
          }

          appendLlmTrafficLog({
            direction: 'inbound',
            source: 'vite-proxy',
            at: new Date().toISOString(),
            upstreamUrl: target,
            status: upstream.status,
            responseBody,
            responseBodyBytes: Buffer.byteLength(text, 'utf8'),
          })

          res.statusCode = upstream.status
          res.setHeader(
            'Content-Type',
            upstream.headers.get('content-type') ?? 'application/json'
          )
          res.end(text)
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          appendLlmTrafficLog({
            direction: 'inbound',
            source: 'vite-proxy',
            at: new Date().toISOString(),
            error: message,
          })
          sendJson(res, 502, { error: message })
        }
      })
    },
  }
}
