import fs from 'node:fs'
import path from 'node:path'

const LOG_DIR = path.resolve(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'llm-traffic.log')

export const LLM_TRAFFIC_LOG_PATH = LOG_FILE

export interface LlmFileLogEntry {
  direction: 'outbound' | 'inbound' | 'client-outbound'
  source: string
  at: string
  [key: string]: unknown
}

export function appendLlmTrafficLog(entry: LlmFileLogEntry): void {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
    const header = `\n${'='.repeat(88)}\n${entry.at}  |  ${entry.direction}  |  ${entry.source}\n${'='.repeat(88)}\n`
    const body = JSON.stringify(entry, null, 2)
    fs.appendFileSync(LOG_FILE, `${header}${body}\n`, 'utf8')
  } catch (err) {
    console.warn('[Monday LLM log] Could not write to', LOG_FILE, err)
  }
}

export function parseJsonSafe(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return { _parseError: true, rawPreview: raw.slice(0, 500) }
  }
}
