#!/usr/bin/env node
/**
 * Checks .env.local and tests the Vite LLM proxy (dev server must be running).
 * Usage: npm run dev   (in another terminal)
 *        npm run check:llm
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const envPath = path.join(root, '.env.local')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return null
  const vars = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq)
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const env = loadEnv(envPath)
if (!env) {
  console.error('❌ .env.local not found. Copy .env.example to .env.local')
  process.exit(1)
}

const apiKey = env.LLM_API_KEY?.trim()
const baseUrl = env.LLM_API_URL?.trim() || 'https://api.openai.com/v1'
const model = env.VITE_LLM_MODEL?.trim() || env.LLM_MODEL?.trim() || 'gpt-4o-mini'
const chatUrl = env.VITE_LLM_CHAT_URL?.trim() || '/api/llm/chat/completions'

console.log('--- Monday LLM config ---')
console.log('LLM_API_KEY:', apiKey ? `set (${apiKey.length} chars)` : 'MISSING')
console.log('LLM_API_URL:', baseUrl)
console.log('Model (client):', model)
console.log('VITE_LLM_CHAT_URL:', chatUrl)

if (!apiKey) {
  console.error('\n❌ Add LLM_API_KEY to .env.local')
  process.exit(1)
}

if (env.LLM_MODEL && env.VITE_LLM_MODEL && env.LLM_MODEL !== env.VITE_LLM_MODEL) {
  console.warn(
    '\n⚠️  LLM_MODEL and VITE_LLM_MODEL differ — the app uses VITE_LLM_MODEL in the browser.'
  )
}

let parsed
try {
  parsed = new URL(baseUrl)
} catch {
  console.error('\n❌ LLM_API_URL is not a valid URL')
  process.exit(1)
}

if (parsed.pathname.includes('chat') || parsed.pathname.includes('completions')) {
  console.warn(
    '\n⚠️  LLM_API_URL should be the API base only (e.g. https://api.openai.com/v1), not /chat/completions'
  )
}

const port = process.env.VITE_PORT || '5173'
const probeUrl = `http://127.0.0.1:${port}${chatUrl.startsWith('/') ? chatUrl : `/${chatUrl}`}`

console.log('\n--- Probing dev proxy ---')
console.log('POST', probeUrl)

let response
try {
  response = await fetch(probeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 16,
    }),
  })
} catch (err) {
  console.error('\n❌ Could not reach dev server:', err.message)
  console.error('   Start it with: npm run dev')
  process.exit(1)
}

const text = await response.text()
let body
try {
  body = JSON.parse(text)
} catch {
  body = text
}

console.log('HTTP status:', response.status)

if (response.ok) {
  const content =
    body?.choices?.[0]?.message?.content ??
    (Array.isArray(body) ? body[0]?.choices?.[0]?.message?.content : undefined)
  console.log('\n✅ LLM connection OK')
  if (content) console.log('Response:', String(content).slice(0, 120))
  process.exit(0)
}

const errMsg =
  (Array.isArray(body) ? body[0]?.error?.message : body?.error?.message) ??
  (typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body).slice(0, 400))

console.error('\n❌ LLM request failed')
if (errMsg) console.error('Provider says:', errMsg)

if (response.status === 503 && String(errMsg).includes('LLM_API_KEY')) {
  console.error('→ Restart npm run dev after editing .env.local')
}

if (response.status === 429) {
  console.error('→ Rate limit / quota exceeded at your provider (not a Monday wiring bug).')
  if (parsed.hostname.includes('google')) {
    console.error('→ Gemini free tier is very small (~20 requests/day). See https://ai.google.dev/gemini-api/docs/rate-limits')
  }
}

if (response.status === 404) {
  console.error('→ Wrong model name for this API URL. Match VITE_LLM_MODEL to your provider.')
}

process.exit(1)
