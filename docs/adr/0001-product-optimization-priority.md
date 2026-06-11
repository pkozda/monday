# ADR-0001: Product optimization priority — AI-first vs Journal-first vs Personal Health Memory-first

**Status:** Accepted  
**Date:** 2026-05-21  
**Deciders:** Product, Engineering  
**Related:** [PERSONAL_HEALTH_MEMORY_SYSTEM_ROADMAP.md](../strategy/PERSONAL_HEALTH_MEMORY_SYSTEM_ROADMAP.md)

---

## Context

Monday has grown as a Vue SPA with multiple capabilities: structured health journal, automatic timeline, clinical model, hypotheses, doctor visit briefs, optional LLM features, appointments, nearby doctor search, dashboard analytics, and multilingual UI.

Stakeholders are converging on a single category:

> **Personal Health Memory System** — Monday remembers a person's health story better than anyone else.

We must choose what the organization optimizes for when making trade-offs in roadmap, UX, marketing, and engineering:

| Option | Definition |
|--------|------------|
| **AI-first** | Lead with LLM features; journal as input to AI outputs |
| **Health Journal-first** | Lead with capture/logging; intelligence is secondary |
| **Personal Health Memory-first** | Lead with longitudinal memory, context, and usability of history across years |

This decision affects feature cuts, MVP scope, metrics, fundraising narrative, and architecture (local-first vs cloud AI gateway).

---

## Decision

**Monday will optimize Personal Health Memory-first.**

Health Journal is **Layer 1** (capture). Health Timeline is **Layer 2** (structure). **Health Context Engine** is **Layer 3** (meaning). AI is an **acceleration layer**, not the product identity.

### Priority stack (highest first)

1. **Personal Health Memory** — completeness, retrieval, context, visit usability  
2. **Health Journal** — low-friction, trustworthy capture  
3. **Health Timeline** — chronological sensemaking  
4. **Health Context Engine** — relationships (treatment → outcome, etc.)  
5. **AI** — optional enhancement where it improves memory quality or visit prep  
6. **Non-core features** — deprioritize or remove (doctor search, AI chat, vanity analytics)

---

## Rationale

### Why not AI-first?

| Argument against AI-first | Evidence in Monday today |
|---------------------------|--------------------------|
| LLM is commoditized | `llmClient.ts` is replaceable; Groq/OpenAI swap trivially |
| Regulatory & trust risk | Product copy already disclaims diagnosis; AI chat increases liability |
| Weak retention alone | Users don't return daily for "ask AI"; they return when health events happen |
| Investor skepticism | "Wrapper" narrative unless data moat exists |
| Offline / privacy story breaks | Core users want on-device memory; AI requires network and disclosure |

AI-first also mispositions Monday against ChatGPT, Ada, K Health — unwinnable categories.

### Why not Journal-first alone?

Journal-first is necessary but **insufficient** as the north star.

| Limitation | Consequence |
|------------|-------------|
| Logging apps churn | Without "why does my history matter?" users stop after 2 weeks |
| No differentiation | Bearable, Flaredown, Apple Health Journal overlap |
| Weak monetization story | "Another notes app" |
| Misses visit moment | Value peaks before appointments — journal alone doesn't surface it |

Monday already goes beyond journal: timeline sync (`healthApi.ts`), clinical model (`clinicalModelGenerator.ts`), visit briefs (`clinicalDoctorNotes.ts`). Journal-first would under-invest in these differentiators.

### Why Personal Health Memory-first?

| Strength | How it maps to Monday |
|----------|----------------------|
| **Compounding moat** | More entries → richer timeline → stronger context → harder to switch |
| **Clear job-to-be-done** | "Remember and use my health story" — especially at doctor visits |
| **Defensible vs portals** | Patient-owned narrative, not provider EHR slice |
| **AI as servant** | LLM improves briefs and context extraction; not the headline |
| **Privacy alignment** | Local-first Dexie (`MondayDB`) supports trust for sensitive data |
| **Acquirer/investor story** | Pre-encounter patient context layer — strategic, not commodity |

The three-layer model (Journal → Timeline → Context Engine) is a **coherent category**, not a feature bundle.

---

## Consequences

### Positive

- Roadmap centers on **visit brief**, **timeline lenses**, and **context relationships**  
- Marketing: *"Monday remembers your health story"* — not *"AI health assistant"*  
- Engineering: invest in domain model, sync, context graph before new AI surfaces  
- Features like nearby doctors map and hypothesis chat are **explicitly out of core**  
- Metrics shift to: retention, span of history, briefs generated, context acknowledged  

### Negative / costs

- Slower "wow" demos that rely on flashy AI chat  
- Requires UX investment in memory retrieval (search, lenses, briefs) — harder than bolting on GPT  
- Context Engine is novel — no off-the-shelf library; must be built incrementally  
- Some existing code (hypothesis assistant, doctor search) becomes legacy or removed  

### Neutral

- AI remains valuable for: visit brief synthesis, anamnesis parsing, optional entry enrichment  
- Backend AI gateway still needed for mobile/production (`MONDAY_2_ARCHITECTURE.md`)  
- i18n and theme stay supporting infrastructure  

---

## Implementation guidelines

1. **Feature gate:** New work must answer: *"Does this help users capture, understand, organize, or use health history?"* If not, defer.  
2. **AI feature bar:** AI ships only when output is **structured**, **linked to journal evidence**, and **user-initiated** (no silent auto-diagnosis).  
3. **Naming:** Prefer "memory", "timeline", "context", "visit brief" over "AI insights", "hypotheses" in user-facing v2 copy (clinical tone can remain internal).  
4. **Deprecations:** Mark non-core modules (`NearbyDoctorSearchPanel`, `HypothesisAssistantDrawer`) as legacy in roadmap; do not expand.  
5. **Architecture:** Prioritize `packages/shared-types`, context engine, timeline lenses before new LLM prompts.  

---

## Alternatives considered

### A. AI-first (rejected)

- **Pros:** Fast demos, press interest, leverages existing LLM investment  
- **Cons:** Commodity, liability, weak moat, misaligned with local-first privacy  

### B. Health Journal-first (rejected as sole north star)

- **Pros:** Simple MVP, clear habit loop  
- **Cons:** Insufficient differentiation; underuses timeline, briefs, clinical model  

### C. Personal Health Memory-first (accepted)

- **Pros:** Category ownership, compounding data, visit wedge, strategic acquisition fit  
- **Cons:** Harder to build; requires Context Engine investment  

### D. Hybrid "equal priority" (rejected)

- **Pros:** Pleases all stakeholders short-term  
- **Cons:** Unfocused roadmap; Monday remains a feature collection  

---

## Success metrics (12-month)

| Metric | Target signal |
|--------|----------------|
| Median journal span | > 90 days of covered history per active user |
| Visit briefs per MAU | > 0.5/month |
| Context cards acknowledged | Users interact with treatment→outcome insights |
| 90-day retention | > 25% for users with 10+ entries |
| AI usage | < 50% of value moments require AI (rule-based path works) |

---

## Review trigger

Revisit this ADR if:

- Regulatory classification changes (e.g. SaMD pressure)  
- A major acquirer/partner requires AI-first positioning  
- Context Engine fails to deliver user value after Stage 2  
- On-device LLM makes AI-first technically differentiated (unlikely near-term)  

---

## References

- [MONDAY_STARTUP_ANALYSIS.md](../../MONDAY_STARTUP_ANALYSIS.md)  
- [MONDAY_2_ARCHITECTURE.md](../../MONDAY_2_ARCHITECTURE.md)  
- [docs/AI_INSIGHTS.md](../AI_INSIGHTS.md)  
