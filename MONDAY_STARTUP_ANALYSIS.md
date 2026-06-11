# Monday as a Startup Product

Analysis based on what the product actually does today: structured health journaling, a longitudinal timeline, pattern/hypothesis views, visit preparation (“notes for your doctor”), and optional AI — positioned as **privacy-first longitudinal medical memory**, not telehealth or diagnosis.

---

## 1. Core user problem

**People with ongoing health issues cannot reliably remember, organize, or communicate their medical story — especially at the moment it matters: before and during a doctor visit.**

The pain shows up as:

| Symptom of the problem | What users feel |
|------------------------|-----------------|
| **Fragmented memory** | Symptoms, meds, and test results live in notes apps, portals, texts, and memory |
| **Visit amnesia** | In a 15-minute appointment, they forget timeline, what helped, what worsened |
| **No single narrative** | GP, specialist, and therapist each see a slice; the patient is the only integrator |
| **Poor preparation** | They arrive with anxiety and anecdotes, not a clear brief |
| **Longitudinal blind spots** | Hard to see “is this getting worse over 6 months?” without effort |

Monday’s journal copy reflects this directly: *“Record symptoms, medications, and changes. Each entry is analyzed and linked to your health timeline.”* Doctor notes reinforce it: *“A clinician-oriented summary from your whole journal… Review and edit before printing.”*

**Primary persona (wedge):** Adults with **chronic or multi-condition health journeys** who see clinicians regularly and self-advocate — not acute emergency users, not healthy wellness-only users.

**Secondary persona:** People preparing for a **specialist referral** who need to tell a coherent story.

---

## 2. Unique value proposition

### One-liner

**Monday is your private medical memory — it turns messy self-reported health notes into a timeline, patterns, and a doctor-ready visit brief.**

### What makes it different (not just “another health app”)

| Competitor category | What they optimize for | What Monday optimizes for |
|--------------------|------------------------|---------------------------|
| Apple Health / wearables | Passive metrics | **Narrative + context** |
| Symptom trackers (Bearable, etc.) | Daily logging | **Cross-visit memory + clinician handoff** |
| Visit recorders (Abridge, Nabla) | Capture *during* the visit | **Prepare *before* the visit** |
| Patient portals (MyChart) | Provider’s records | **Patient-owned story** |
| ChatGPT / generic AI | One-off answers | **Structured longitudinal model built from your journal** |
| Notion / notes | Flexibility | **Medical structure** (urgency, body area, timeline, specialty briefs) |

### The real UVP (defensible framing)

> **“The only place that remembers your full health story the way you experience it — and helps you show up prepared.”**

Privacy/local-first is not the whole product — it is **trust infrastructure** that makes people willing to log sensitive symptoms. That matters for positioning (especially EU, chronic illness communities, mental health) but the **job-to-be-done** is **visit preparation + longitudinal sensemaking**.

---

## 3. Most defensible features

Ranked by **moat strength** (hard to copy, compounds over time, tied to core problem):

### Tier A — Core moat (build the company here)

1. **Structured health journal → timeline pipeline**  
   Every entry is classified (urgency, type, body area) and linked to a longitudinal timeline. **More entries = more valuable product.** This is a classic data flywheel on-device.

2. **Doctor visit brief by specialty**  
   `doctorNotes` with specialty-specific framing (cardiology vs orthopedics vs psychiatry) is rare in consumer apps. It maps directly to the visit moment and is **high willingness-to-pay / high retention** if it works well.

3. **Clinical model / body-area synthesis**  
   “Your clinical model” across tracked conditions is system-level thinking — not a single symptom chart. It becomes the **mental model** users adopt: “Monday knows my health map.”

4. **Anamnesis import**  
   Bulk paste of history → structured entries lowers onboarding friction for people with **years** of history. Strong for activation and switching costs.

5. **Journal ↔ appointments linkage**  
   Doctor visits auto-created from journal entries connects **logging** to **scheduling** — natural habit loop before appointments.

### Tier B — Differentiating but easier to copy

6. **Hypotheses per body area** (with evidence links, confidence, history)  
   Valuable if positioned as *“patterns to discuss with your doctor”* — not diagnosis. Rule-based version is already useful; AI is accelerant, not moat.

7. **Privacy-first / local-only storage**  
   Strong brand and regulatory story; weak alone as moat (others can add on-device storage).

8. **Multilingual (EN/DE/RU)**  
   Niche wedge for expats and European users; not global moat.

### Tier C — Not defensible (commodity or distraction)

- Nearby doctors map (Google Places / OSM)
- Hypothesis AI chat assistant
- Generic dashboard charts
- LLM translation layer
- Notification toasts for long AI jobs

---

## 4. Features that can be removed (or deferred)

For a **focused startup**, cut anything that does not strengthen “remember → understand → prepare for visit.”

| Feature | Verdict | Why |
|---------|---------|-----|
| **Find doctors near me + map** | **Remove from MVP** | Commodity, API cost, map UX cost, not core job; users already use Google Maps |
| **Hypothesis AI assistant chat** | **Defer** | Liability, scope, support burden; “visit brief” covers 80% of prep value |
| **Dashboard charts** (donuts, bars, severity line) | **Simplify** | Impressive in demos, weak retention driver; replace with 2–3 actionable stats |
| **Regenerate-all-hypotheses** complexity | **Simplify** | One clear “refresh insights” action; less cognitive load |
| **UI LLM translation** | **Defer** | Static i18n is enough for wedge markets |
| **14 specialty doctor search queries** | **Remove** with map | Goes with doctor finder |
| **Timeline as separate mental model** | **Merge into Dashboard/Journal** | Already partially orphaned (`Timeline.vue` unrouted) |
| **Clinical model AI refinement** | **Optional tier** | Rule-based model + AI brief is enough for MVP |
| **Heavy notification center** | **Simplify to toasts** | Nice for dev; not a selling point |
| **Health recommendations library** | **Keep lite version** | Good activation (DOB → screening tips) but don’t lead marketing with generic wellness |

### What a ruthless MVP keeps

```
Journal (structured logging)
  → Timeline (automatic)
  → Body-area / clinical summary
  → "Prepare for visit" brief (by specialty)
  → Appointments (lightweight reminder)
  → Profile (DOB, sex for recommendations)
```

Everything else is **v2**.

---

## 5. Ideal landing page message

### Primary headline (recommended)

**Remember your health story. Walk into every visit prepared.**

### Supporting subhead

Monday is a private health journal that builds your timeline, spots patterns across body areas, and creates a clear brief for your doctor — on your device, under your control.

### Three proof bullets (above the fold)

1. **Log once** — symptoms, meds, visits; Monday structures and classifies each entry  
2. **See the arc** — timeline and patterns across weeks and months, not scattered notes  
3. **Show up ready** — one-tap visit brief tailored to your doctor’s specialty  

### Trust line (footer / hero secondary)

*Not a diagnosis. Not a replacement for your clinician. Your data stays on your device.*

### What to avoid on the landing page

- “AI-powered healthcare platform” (sounds like telehealth + liability)
- “Find doctors near you” (commodity, wrong wedge)
- “Generate hypotheses” (clinical tone scares users; regulators notice)
- Chart/dashboard screenshots as hero (metrics ≠ outcome)

### Alternative headlines by audience

| Audience | Headline |
|----------|----------|
| Chronic illness | **Your symptoms have a timeline. Your doctor should see it.** |
| Privacy-conscious EU | **A health journal that never has to leave your phone.** |
| Specialist prep | **From scattered notes to a one-page brief for your specialist.** |

---

## 6. MVP attractive to investors or acquirers

Investors and acquirers don’t buy feature lists. They buy **a wedge, retention, expansion, and strategic fit**.

### The wedge MVP (8–12 weeks of product focus)

**Product name internally:** *“Visit Prep Journal”*

| Capability | Investor story |
|------------|----------------|
| Structured journal (5–7 entry types) | Daily/weekly habit, retention hook |
| Auto timeline + urgency flags | Immediate value without AI |
| Body-area clinical summary (rule-based) | “System of record” for patient narrative |
| **Specialty visit brief** (1-tap export/copy/print) | **Monetization + virality** (“prepared by Monday”) |
| Next appointment reminder | Ties logging to visit cycle |
| Anamnesis import | Fast onboarding for high-LTV users |
| Local-first, no account required | Low friction, privacy PR, EU-ready |

**Optional paid tier:** AI-enhanced visit brief + pattern narrative (not required for MVP demo).

### Metrics that would excite investors

| Metric | Why it matters |
|--------|----------------|
| **Entries per active user per month** | Habit / data flywheel |
| **Visit briefs generated per user** | Core value moment |
| **% users with 30+ day retention** | Longitudinal product = long retention if job is real |
| **Time from signup → first brief** | Activation (target: <7 days) |
| **Brief → return after appointment** | Loop closure |

### Why an acquirer would care

| Acquirer type | Strategic fit |
|---------------|---------------|
| **Patient engagement / EHR adjacent** (Epic, Oracle Health, athena) | Pre-visit patient-reported narrative layer |
| **Health insurers / care navigation** | Better-informed members, reduced redundant visits |
| **Telehealth** (Teladoc, etc.) | Async prep before synchronous visit |
| **Apple / big tech health** | On-device, privacy-aligned longitudinal PHR narrative |
| **Chronic care platforms** | Condition tracking + clinician handoff |

Monday is **not** an acquirer target as “LLM wrapper” or “doctor finder.” It **is** interesting as **patient-owned longitudinal context** that slots **before** the clinical encounter.

### Investor pitch in one paragraph

> Hundreds of millions of people manage chronic or complex health issues with fragmented notes and forgotten context. Monday is a privacy-first journal that automatically builds a longitudinal health narrative and produces specialty-tailored visit briefs — turning the patient into a prepared partner, not a passive record. Data compounds on-device, visit prep is the monetizable moment, and the product sits upstream of telehealth, EHR, and care navigation without competing for diagnosis or prescribing.

### MVP explicitly **not** needed for investor demo

- Cloud sync / accounts (local-first is a feature for v1 story)
- iOS native app (responsive web + Capacitor later is fine for seed)
- Doctor search / maps
- Chat assistant
- Full dashboard analytics

---

## Strategic summary

| Question | Answer |
|----------|--------|
| **Core problem** | Patients can’t remember or communicate their health story at visits |
| **UVP** | Private medical memory → timeline → doctor-ready brief |
| **Defensible core** | Journal flywheel, visit briefs, clinical synthesis, anamnesis onboarding |
| **Cut** | Doctor map, AI chat, chart vanity, heavy AI everywhere |
| **Landing message** | *Remember your health story. Walk into every visit prepared.* |
| **Investor MVP** | Journal + timeline + specialty visit brief + appointment loop; local-first |

---

## Honest startup risks

1. **Retention** — logging apps die without a sharp moment of value; visit brief must be that moment  
2. **Liability framing** — must stay “preparation, not diagnosis” in product and marketing  
3. **AI is not the moat** — Groq/OpenAI commoditize; structure + UX + data depth are the moat  
4. **Go-to-market** — chronic illness communities, Reddit, patient advocates, not broad “health & wellness”  
5. **Revenue path** — subscription on AI briefs, or B2B2C via clinics/employers; free journal as top of funnel  

---

## Related documents

- [MONDAY_2_ARCHITECTURE.md](./MONDAY_2_ARCHITECTURE.md) — Technical architecture for Monday 2.0  
- [CAPACITOR_IOS_MIGRATION.md](./CAPACITOR_IOS_MIGRATION.md) — Capacitor iOS migration plan  
- [docs/AI_INSIGHTS.md](./docs/AI_INSIGHTS.md) — AI feature setup and privacy notes  
