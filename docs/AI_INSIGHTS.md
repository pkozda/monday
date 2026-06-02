# AI insights

Monday can use an **OpenAI-compatible** LLM to:

1. **Translate journal text** — Russian entries are translated to English with AI when you save (handles typos and uncommon medical wording). Requires `LLM_API_KEY` in `.env.local` (same proxy as insights). Without it, a limited free MyMemory fallback is used.
2. **Analyze journal entries** — structured symptoms and a clinical summary when you save an entry.
3. **Generate hypotheses** — only when you click *Generate* on the Hypotheses page (AI insights must be on). Nothing runs automatically on first visit.
4. **Current clinical model** (Dashboard) — refines the rule-based summary and key factors from your full journal.
5. **Notes for doctor** (from a hypothesis or clinical model) — a clinician-oriented visit brief (timeline highlights, red flags, discussion questions), not a raw journal dump.

## Setup (local development)

1. Copy `.env.example` to `.env.local`.
2. Set `LLM_API_KEY` (never commit this file).
3. Set `LLM_API_URL` and `LLM_MODEL` (see `.env.example` — Groq `llama-3.1-8b-instant` is the default example).
4. Run `npm run dev`.
5. In the app nav, enable **AI insights**.

The Vite dev server proxies `/api/llm/*` to your provider so the API key stays on the machine running Vite, not in the browser bundle.

### LLM traffic log (development)

While `npm run dev` is running, every request and response is appended to **`logs/llm-traffic.log`** in the project root (API keys are never written — only message payloads). Restart the dev server after pulling changes; the console prints the log path on startup.

## Privacy

When AI insights are on, journal text is sent to the configured API for the actions above. Data still lives in **IndexedDB** on your device; the LLM provider’s privacy policy applies to those requests.

With AI off, Monday uses only the existing **rule-based** engines (no LLM calls).

## Production

For a deployed build you need your own backend (or serverless function) that:

- Holds `LLM_API_KEY` securely
- Exposes an OpenAI-compatible `POST /chat/completions` endpoint
- Sets `VITE_LLM_CHAT_URL` to that endpoint at build time

Without that, the AI toggle is hidden (`VITE_LLM_CHAT_URL` unset).

## Body focus areas

Before hypotheses are generated, Monday runs a **full-journal focus pass**:

- Scans every entry (text, tags, AI symptom hints)
- Merges duplicates (e.g. left leg + legs → **Legs**)
- Assigns each entry to **one primary** body region to avoid double-counting
- Adds **General health** only for systemic / unattributed entries

With **AI insights** on, an LLM refines that focus plan; otherwise the rule-based merger runs.

If the LLM fails (timeout, rate limit, invalid JSON), Monday logs a warning and falls back to rule-based analysis for that step.

## Groq and large journals

Your **full journal stays in IndexedDB** — nothing is deleted or truncated in storage when prompts are large.

Before each API call, Monday:

- Estimates input tokens (~3.6 characters per token).
- Keeps each request under `VITE_LLM_MAX_INPUT_TOKENS` (default 8000), minus output tokens and a safety margin.
- Splits oversized **prompts** by journal entry batches (map → summarize excerpts → reduce to final JSON/text).
- Retries 429/502/503 with exponential backoff (up to ~32s between attempts).
- Logs `[Monday LLM]` lines with estimated tokens, chunk count, and request body size in the browser console.

Tune in `.env.local`: `VITE_LLM_MAX_INPUT_TOKENS`, `VITE_LLM_CHUNK_TARGET_TOKENS`, `VITE_LLM_SAFETY_MARGIN_TOKENS`. Explicit `maxTokens` on a call (e.g. hypotheses) overrides the default **512** output cap for that request only.

### TPM queue (Groq rate limits)

All LLM calls share one **FIFO queue** (one active request at a time). Before each send:

- Estimated tokens are checked against a rolling **60s TPM window** (`VITE_LLM_TPM_LIMIT` × `VITE_LLM_TPM_SAFETY_RATIO`, default 6000 × 0.85).
- The queue waits until headroom exists; chunked map-reduce steps run **sequentially**.
- **429** responses honor `Retry-After` / “try again in Ns” plus exponential backoff **with jitter** (retries stay inside the same queue job — no duplicate enqueue).
- Minimum gap between requests: `VITE_LLM_MIN_REQUEST_GAP_MS` (default 350ms).

Console: `[Monday LLM Queue]` logs queue size, TPM used/limit, wait times, and retry counts. The UI thread stays responsive while work waits asynchronously.
