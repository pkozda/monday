# AI insights

Monday can use an **OpenAI-compatible** LLM to:

1. **Analyze journal entries** — structured symptoms and a clinical summary when you save an entry.
2. **Generate hypotheses** — when you click *Regenerate hypotheses & conditions* with AI enabled.
3. **Rank diagnoses** — the LLM orders possible conditions and assigns percentages per body area. It may suggest **new conditions** not in the built-in catalog (`custom-*` ids). Criteria and journal flags still come from rule-based inference when a catalog match exists.
4. **Current clinical model** (Dashboard) — refines the rule-based summary and key factors from your full journal.
5. **Notes for doctor** (from a hypothesis) — a clinician-oriented visit brief (timeline highlights, red flags, discussion questions), not a raw journal dump.

## Setup (local development)

1. Copy `.env.example` to `.env.local`.
2. Set `LLM_API_KEY` (never commit this file).
3. Optionally set `LLM_API_URL` and `LLM_MODEL` (defaults: OpenAI `gpt-4o-mini`).
4. Run `npm run dev`.
5. In the app nav, enable **AI insights**.

The Vite dev server proxies `/api/llm/*` to your provider so the API key stays on the machine running Vite, not in the browser bundle.

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

Before hypotheses or diagnoses are generated, Monday runs a **full-journal focus pass**:

- Scans every entry (text, tags, AI symptom hints)
- Merges duplicates (e.g. left leg + legs → **Legs**)
- Assigns each entry to **one primary** body region to avoid double-counting
- Adds **General health** only for systemic / unattributed entries

With **AI insights** on, an LLM refines that focus plan; otherwise the rule-based merger runs.

If the LLM fails (timeout, rate limit, invalid JSON), Monday logs a warning and falls back to rule-based analysis for that step.
