# Capacitor iOS Migration Plan — Monday Health Platform

Analysis of the codebase at `/Users/benvolio/Documents/Monday SHI/dev`.

**Status:** Planning document — no Capacitor changes implemented yet.

---

## Executive summary

Monday is a **Vue 3.5 + Vite 5 SPA** that is **local-first**: health data lives in **Dexie/IndexedDB** on the device. There is **no user auth**, **no production backend**, and **no Capacitor/PWA setup** today.

Capacitor is a good fit for a **WebView shell** around the existing Vue app. The main work is not “rewrite Vue” — it is:

1. **Replace dev-only Vite API proxies** with a real HTTPS backend (LLM, nearby doctors, translation).
2. **Adapt desktop layouts** for phone screens (Dashboard, Appointments, Hypotheses).
3. **Add iOS-native plumbing** (permissions, safe areas, clipboard, optional geolocation plugin).
4. **Harden routing, storage, and network** for WKWebView behavior.

**Recommended approach:** phased migration — shell first with local-only features, then backend, then map/AI-heavy flows.

---

## Current architecture (as-is)

| Layer | Technology | Notes |
|--------|------------|--------|
| UI | Vue 3 Composition API, custom CSS tokens | No Vuetify/Tailwind |
| Routing | `vue-router` + `createWebHistory()` | 4 routes: Dashboard, Hypotheses, Journal, Appointments |
| State | Composables + module-level `ref()` | No Pinia/Vuex |
| Persistence | Dexie v7 (`MondayDB`) + `localStorage` | 7 tables; migrations on startup |
| i18n | `vue-i18n` (en/de/ru) | + optional LLM UI translation |
| Maps | Leaflet 1.9 + OSM tiles | Appointments only |
| Build | `vue-tsc && vite build` → `dist/` | Absolute asset paths (`/assets/...`) |

### Project structure

| Path | Purpose |
|------|---------|
| `index.html` | HTML shell, theme flash script, viewport |
| `src/main.ts` | App bootstrap, DB migrations, dev helpers |
| `src/App.vue` | Root layout (header, router-view, toasts) |
| `src/router/index.ts` | Route definitions |
| `src/views/` | Page-level views (5 files) |
| `src/components/` | Reusable UI (~44 `.vue` files) |
| `src/composables/` | Shared reactive logic (11 composables) |
| `src/api/` | Data access layer (9 API modules) |
| `src/db/` | Dexie/IndexedDB schema, migrations, seed |
| `src/services/` | Business logic, LLM, translation |
| `src/i18n/` | vue-i18n setup + locale files |
| `scripts/` | Vite plugins, dev tooling |
| `dist/` | Production build output |

### Dependencies (`package.json`)

| Package | Version (declared) | Role |
|---------|-------------------|------|
| `vue` | ^3.3.11 | Framework |
| `vue-router` | ^4.2.5 | Routing |
| `vue-i18n` | ^9.14.5 | Internationalization |
| `vite` | ^5.0.8 | Build tool |
| `dexie` | ^4.4.2 | IndexedDB ORM |
| `leaflet` | ^1.9.4 | Maps |
| `date-fns` | ^2.30.0 | Date utilities |

**Not present:** `@capacitor/*`, PWA plugins, Pinia, UI component libraries.

### Routes

| Path | Name | Component |
|------|------|-----------|
| `/` | `dashboard` | `Dashboard.vue` |
| `/timeline` | — | redirect → `/` |
| `/hypotheses` | `hypotheses` | `Hypotheses.vue` |
| `/journal` | `journal` | `HealthLog.vue` |
| `/appointments` | `appointments` | `Appointments.vue` |

`Timeline.vue` exists but is not routed (timeline data shown on Dashboard).

### Dexie schema (`MondayDB`, v7)

| Table | Indexed fields | Entity |
|-------|----------------|--------|
| `clinicalModels` | `id` | `ClinicalModel` |
| `timelineEvents` | `id, date, type` | `TimelineEvent` |
| `hypotheses` | `id, confidence` | `Hypothesis` |
| `healthEntries` | `id, eventDate, entryType, conditionArea, createdAt` | `HealthEntry` |
| `patientProfiles` | `id` | `PatientProfile` |
| `appointments` | `id, scheduledAt, createdAt` | `DoctorAppointment` |
| `hypothesisAssistantChats` | `id, updatedAt` | `StoredHypothesisAssistantChat` |

### Dev-only network layer (critical gap)

These run only when `npm run dev` is active:

| Endpoint | Plugin / config | Secrets |
|----------|-----------------|---------|
| `/api/llm/chat/completions` | `scripts/vite-llm-proxy-plugin.ts` | `LLM_API_KEY` |
| `/api/doctors/nearby`, `/reverse`, `/status` | `scripts/vite-doctors-nearby-plugin.ts` | `GOOGLE_PLACES_API_KEY` (optional) |
| `/api/translate` | Vite `server.proxy` | None (MyMemory) |
| `/__monday/db-snapshot` | `scripts/vite-db-snapshot-plugin.ts` | Dev tooling only |

In a Capacitor build, relative `/api/*` calls **404** unless you add a backend or bake in external URLs at build time.

### Environment variables (`.env.example`)

| Variable | Scope | Purpose |
|----------|-------|---------|
| `LLM_API_KEY` | Server/dev only | OpenAI-compatible API key |
| `LLM_API_URL` | Server/dev only | Default: Groq |
| `LLM_MODEL` | Server/dev only | Model ID |
| `VITE_LLM_CHAT_URL` | Client bundle | Default: `/api/llm/chat/completions` |
| `VITE_LLM_MODEL` | Client bundle | Model ID exposed to client |
| `VITE_LLM_*` (tokens, TPM) | Client bundle | Chunking and throttling |
| `GOOGLE_PLACES_API_KEY` | Server/dev only | Nearby doctor search (optional) |
| `VITE_TRANSLATION_URL` | Client (optional) | MyMemory fallback |

### Feature surface (by complexity on iOS)

| Feature | Local data? | Network? | Mobile difficulty |
|---------|-------------|----------|-------------------|
| Journal CRUD | Yes | Optional AI | Medium |
| Appointments CRUD + calendar | Yes | No | High (layout) |
| Dashboard stats/charts | Yes | Optional AI | High (density) |
| Hypotheses + assistant chat | Yes | LLM required | Very high |
| Nearby doctors + map | No | Doctors API + geolocation | Very high |
| Doctor notes / clinical model | Yes | LLM required | High |
| Theme / locale / notifications | Yes | No | Low |

---

## Capacitor fit assessment

### What ports cleanly

- Vue SPA build into `dist/` as `webDir`
- Dexie/IndexedDB in WKWebView (same as Safari)
- `localStorage` for theme, locale, AI toggle
- Custom SVG/CSS charts (no heavy chart libs)
- `tel:` / `mailto:` links for doctor contacts
- Rule-based fallbacks when AI is off

### What needs explicit work

- **API proxies** → hosted backend
- **`createWebHistory()`** → hash history or Capacitor deep-link config
- **Geolocation** → Info.plist + possibly `@capacitor/geolocation`
- **Clipboard** → `@capacitor/clipboard` fallback (`DoctorNotesPanel.vue`)
- **Safe areas / keyboard** → CSS + modal patterns
- **Leaflet** → test tiles/performance; consider native map later
- **File export** (`src/db/snapshot.ts`) → Share/Filesystem plugins
- **Long LLM requests** → background suspension on iOS

### What you can defer

- Push notifications (none today)
- Biometrics / auth (none today)
- Camera / file upload (none today)
- Android (plan iOS first; Capacitor supports both later)

### Native-adjacent APIs in use today

| API | File(s) | Mobile note |
|-----|---------|-------------|
| `navigator.geolocation` | `useNearbyDoctorSearch.ts` | Needs Info.plist; consider Capacitor plugin |
| `navigator.clipboard.writeText` | `DoctorNotesPanel.vue` | WKWebView may need Capacitor fallback |
| `navigator.permissions.query` | `useNearbyDoctorSearch.ts` | Limited on iOS WKWebView |
| `tel:` / `mailto:` links | `NearbyDoctorResultsList.vue` | Works via system handlers |
| Blob download | `src/db/snapshot.ts` | Unreliable on iOS; use Share plugin |
| In-app toasts only | `useNotifications.ts` | No native push |

---

## Recommended migration strategy

Four phases with clear go/no-go gates:

```
Phase 0: Foundation spike
    ↓
Phase 1: Shell + local features (MVP)
    ↓
Phase 2: Backend + AI
    ↓
Phase 3: Mobile UX + map
    ↓
Phase 4: Polish + App Store
```

---

## Phase 0 — Foundation & spike (1–2 weeks)

**Goal:** Prove the app loads in iOS Simulator with core local flows.

### Tasks

1. **Add Capacitor**
   - `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`
   - `capacitor.config.ts` with `webDir: 'dist'`
   - Scripts: `cap:sync`, `cap:open:ios`

2. **Build configuration**
   - Evaluate `base: './'` vs keeping `/` (test asset loading in WKWebView)
   - Add `cap sync` to CI/build pipeline
   - Document iOS/Xcode requirements (Apple Silicon, CocoaPods)

3. **Router spike**
   - Test `createWebHistory()` in Capacitor
   - If refresh/deep links fail → switch to `createWebHashHistory()` or Capacitor `server` config

4. **Storage spike**
   - Cold start: Dexie migrations in `src/main.ts`
   - Create journal entry, kill app, relaunch — data persists?
   - Note: `sessionStorage` drafts may not survive process kill

5. **Permissions scaffold**
   - `Info.plist`: `NSLocationWhenInUseUsageDescription` (even if map is Phase 3)

### Exit criteria

- App launches in Simulator
- Journal list/create works offline
- No white screen / asset 404s
- Dexie data survives app restart

---

## Phase 1 — iOS shell + local-first MVP (2–3 weeks)

**Goal:** Shippable **offline-capable** iOS app for journal + appointments (no AI, no map).

### Capacitor plugins (minimum)

| Plugin | Use case |
|--------|----------|
| `@capacitor/app` | Lifecycle, back button, app state |
| `@capacitor/status-bar` | Style status bar with theme |
| `@capacitor/keyboard` | Modal keyboard overlap |
| `@capacitor/splash-screen` | Launch experience |
| `@capacitor/clipboard` | Doctor notes copy fallback |

### UI adaptations (P1 scope)

| Screen | Change |
|--------|--------|
| **AppHeader** | Safe-area insets (`env(safe-area-inset-top)`), bottom tab bar optional |
| **Journal** | Full-screen modal pattern; keyboard-aware scroll |
| **Appointments** | Hide `NearbyDoctorSearchPanel`; single-column calendar + lists |
| **Dashboard** | Collapsed stats; hide or simplify charts |
| **Hypotheses** | List only; disable regenerate if no backend |

### Feature flags / build profiles (planned)

- `VITE_ENABLE_AI=false` → hide AI toggle, use rule-based engines
- `VITE_ENABLE_NEARBY_DOCTORS=false` → hide map panel
- `VITE_API_BASE_URL=` → empty until Phase 2

### Exit criteria

- TestFlight build with journal + appointments CRUD
- Theme + locale work
- In-app toasts work
- AI and map clearly disabled or show “requires connection” messaging

---

## Phase 2 — Backend & AI enablement (3–4 weeks)

**Goal:** Parity with dev-server proxies for production iOS.

### Backend options

| Option | Pros | Cons |
|--------|------|------|
| **A. Single Node/Express API** | Reuse logic from Vite plugins | You operate a server |
| **B. Serverless (Vercel/Cloudflare Workers)** | Low ops, scales to zero | Cold starts; 90s LLM timeout needs care |
| **C. Supabase Edge Functions** | Auth-ready later | New dependency |
| **D. Direct LLM from app** | Fast to wire | **Never put API keys in the app** — reject |

**Recommendation:** **Option A or B** — extract `vite-llm-proxy-plugin.ts` and `vite-doctors-nearby-plugin.ts` into shared server modules (reuse `scripts/doctors-nearby-shared.ts`).

### Required API surface

```
POST /api/llm/chat/completions     # OpenAI-compatible proxy
GET  /api/doctors/nearby           # or POST — match current client
GET  /api/doctors/reverse
GET  /api/doctors/status
GET  /api/translate                # optional; or keep direct MyMemory with CORS fallback
```

### Client changes (planned)

- `VITE_API_BASE_URL=https://api.yourdomain.com` at iOS build time
- `src/services/llm/llmClient.ts` — prefix URLs with base
- `src/api/nearbyDoctorsApi.ts` — same
- `src/services/myMemoryClient.ts` — route through backend if direct CORS fails

### AI-specific mobile concerns

- **90s fetch timeout** in `llmClient.ts` — iOS may suspend background WebView
- **FIFO queue** (`llmRequestQueue.ts`) — show “request in progress” when app backgrounds
- **Privacy copy** — App Store needs clear disclosure that journal text is sent to LLM provider when AI is on (see `docs/AI_INSIGHTS.md`)

### Exit criteria

- Hypothesis generation, doctor notes, journal AI analysis work on device
- API keys never in app bundle (verify with `strings` on IPA)
- Rate limiting / error handling for offline and timeout

---

## Phase 3 — Mobile UX + map/geolocation (3–4 weeks)

**Goal:** Production-quality layouts and nearby doctors.

### Layout redesign priorities

1. **Appointments** — replace 3-column grid with tabs: `Calendar | Upcoming | Past | Find doctors`
2. **Nearby doctors** — map/list toggle or bottom sheet; not side-by-side on phone
3. **Dashboard** — summary cards + drill-down; conditions table → card list
4. **Hypothesis assistant** — full-screen chat instead of right drawer
5. **Global** — consistent breakpoints; safe-area on all fixed headers/footers

### Heavy desktop layouts needing mobile redesign

| Layout | Issue |
|--------|-------|
| Appointments 3-column grid | Calendar + upcoming + past side-by-side |
| Nearby doctors map + list split | Fixed min-height 400px split pane |
| Dashboard stat grid | 8+ cards before charts |
| Dashboard charts row | 4 chart panels |
| Conditions HTML table | Horizontal scroll only |
| Hypothesis assistant drawer | Fixed right panel |
| Patient profile header | Cramped toolbar on narrow phones |

### Geolocation

| Approach | Notes |
|----------|-------|
| **Web API** (`navigator.geolocation`) | May work in WKWebView with Info.plist |
| **Capacitor Geolocation** | More reliable; abstract in `useNearbyDoctorSearch.ts` |

Planned abstraction:

```ts
// composables/useDeviceLocation.ts (future)
// Capacitor.isNativePlatform() ? Geolocation.getCurrentPosition() : navigator.geolocation
```

### Leaflet on iOS

- OSM tiles over HTTPS — generally fine
- Watch memory with many markers
- Test pinch-zoom and marker tap targets (44pt minimum)
- **Future:** `@capacitor/google-maps` or MapKit if Leaflet feels sluggish

### Exit criteria

- Nearby doctor search works end-to-end on physical device
- Map centers correctly on list selection
- Location permission flow is App Store compliant

---

## Phase 4 — Polish, compliance, App Store (2–3 weeks)

### App Store / healthcare considerations

| Topic | Action |
|-------|--------|
| **Privacy Nutrition Labels** | Declare health data stored on-device; network if AI enabled |
| **Health data** | Not HIPAA-covered unless you add cloud sync; still need clear privacy policy |
| **Location** | Purpose string for doctor search only |
| **LLM data** | Disclose third-party processing (Groq/OpenAI/etc.) |
| **Medical claims** | Position as personal health journal / memory aid, not diagnostic device |

### Technical polish

- App icon + splash (extend `public/apple-touch-icon.png` to full asset set)
- `@capacitor/share` for doctor notes export and DB backup
- `@capacitor/filesystem` for JSON export/import (replace dev `db-snapshot` plugin)
- Offline indicator when API unreachable
- Crash/analytics (optional: Sentry for WebView errors)

### Testing (currently none)

| Layer | Tool | Priority |
|-------|------|----------|
| Unit | Vitest | Dexie migrations, API URL builders |
| Component | Vue Test Utils | Forms, modals |
| E2E | Playwright (web) + manual iOS QA | Journal → timeline sync |
| Native | Xcode + TestFlight | Permissions, keyboard, background |

### Exit criteria

- TestFlight beta with 10+ testers
- App Review submission package (screenshots, privacy policy, support URL)

---

## Proposed repository structure (after migration)

```
dev/
├── src/                    # Vue app (with mobile adapters)
├── ios/                    # Capacitor-generated Xcode project
├── capacitor.config.ts
├── server/                 # NEW: extracted API from Vite plugins (recommended)
│   ├── llm-proxy.ts
│   ├── doctors-nearby.ts
│   └── index.ts
├── scripts/                # build/dev tooling
└── docs/
    └── CAPACITOR_IOS.md    # operational runbook (optional)
```

---

## Risk register

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **No production API** — AI & doctors broken in Capacitor build | Critical | Certain | Phase 2 backend before marketing AI/map |
| **API keys in client bundle** | Critical | Medium if rushed | Server-only secrets; build-time audit |
| **IndexedDB eviction on iOS** | High | Low–Medium | Export/backup flow; warn users; avoid huge blobs |
| **WKWebView LLM timeout / background kill** | High | Medium | Queue UX; retry; shorter chunks (already chunked) |
| **Desktop layouts on phone** | High | Certain | Phase 1 hide complex views; Phase 3 redesign |
| **Leaflet performance** | Medium | Medium | Limit markers; native map fallback |
| **Geolocation permission denial** | Medium | Medium | Manual location entry fallback (not built today) |
| **`createWebHistory` routing** | Medium | Medium | Hash history fallback |
| **MyMemory CORS/rate limits** | Medium | Medium | Backend translate proxy |
| **No automated tests** | Medium | Certain | Add Vitest + manual TestFlight matrix |
| **App Store health scrutiny** | Medium | Medium | Clear disclaimers; no diagnostic claims |
| **sessionStorage draft loss** | Low | High on iOS | Persist drafts to `localStorage` |

---

## Recommendations

### 1. Do not “big bang” the migration

Ship **Phase 1** (local journal + appointments) to TestFlight early. It validates Capacitor, Dexie, and navigation without backend cost.

### 2. Extract a real backend before iOS launch

Reuse logic from:

- `scripts/vite-llm-proxy-plugin.ts`
- `scripts/vite-doctors-nearby-plugin.ts`
- `scripts/doctors-nearby-shared.ts`

**Move** shared handlers into `server/` and call from both Vite (dev) and production — do not duplicate.

### 3. Introduce a `platform` abstraction layer

```ts
// src/platform/index.ts (future)
export const isNative = Capacitor.isNativePlatform()
export const location = ...
export const clipboard = ...
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

Keeps Vue components clean and testable.

### 4. Router: plan for hash history on iOS v1

`createWebHistory()` often causes issues with `capacitor://localhost`. **Hash mode** is the lowest-risk v1 choice; revisit deep linking later.

### 5. Mobile navigation: consider bottom tabs

Four top-level routes map well to a **bottom tab bar** on iOS (Dashboard, Journal, Appointments, Hypotheses). Hamburger menu is workable but less native-feeling.

### 6. Keep AI optional at build time

Aligns with privacy positioning. Rule-based engines already exist — iOS v1 can ship with AI off until backend is stable.

### 7. Add tests with Phase 2

Minimum: Dexie migration tests + `llmClient` URL resolution + appointment/journal sync integration tests.

### 8. Document env matrix

| Variable | Web dev | Web prod | iOS build |
|----------|---------|----------|-----------|
| `VITE_LLM_CHAT_URL` | `/api/llm/...` | `https://api.../llm/...` | Same as prod |
| `VITE_API_BASE_URL` | `''` | `https://api...` | Required |
| `LLM_API_KEY` | `.env.local` | Server only | Server only |

---

## Rough timeline (one developer, part-time)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0 — Foundation spike | 1–2 weeks | 2 weeks |
| 1 — Local MVP shell | 2–3 weeks | 5 weeks |
| 2 — Backend + AI | 3–4 weeks | 9 weeks |
| 3 — Mobile UX + map | 3–4 weeks | 13 weeks |
| 4 — App Store polish | 2–3 weeks | **~16 weeks** |

Parallel backend + UI work can shorten this to **~10–12 weeks** with two developers.

---

## Decision points (need input before implementation)

1. **Backend hosting** — self-hosted Node vs serverless vs none (AI/map disabled in v1)?
2. **iOS v1 scope** — full parity vs journal + appointments only?
3. **Map** — keep Leaflet in WebView vs native MapKit/Google Maps?
4. **Monorepo** — add `server/` in same repo vs separate API repo?
5. **Android** — plan now (shared Capacitor config) or iOS-only first?

---

## Suggested first implementation steps (when approved)

1. Capacitor init + iOS platform + `npm run build && cap sync`
2. Router/hash history spike in Simulator
3. `VITE_ENABLE_AI` / `VITE_ENABLE_NEARBY_DOCTORS` feature flags
4. Safe-area CSS on `App.vue` / `AppHeader`
5. Scaffold `server/` from existing Vite plugins
6. TestFlight build of local-only MVP

---

## Hardest to port (ranked)

### Tier 1 — Architectural blockers

1. Dev-only API middleware (`/api/llm/*`, `/api/doctors/*`)
2. Leaflet + geolocation + Places/OSM
3. LLM-heavy flows (hypotheses, assistant chat, doctor notes, clinical model)

### Tier 2 — UI/UX redesign required

4. Appointments page (3-column + map panel)
5. Dashboard (stats + charts + table + profile)
6. Hypothesis assistant drawer + chat
7. Journal entry form (~700 lines, type picker grid)

### Tier 3 — Integration friction

8. Dexie + 7 schema versions on real iOS WebView
9. Many `Teleport` modals — scroll lock and focus on WKWebView
10. `window` CustomEvents for cross-view coordination
11. Translation proxy
12. No automated tests today

### Tier 4 — Lower effort

- Custom SVG/CSS charts
- Journal list + cards
- Theme/locale/i18n
- Orphan `Timeline.vue`

---

## Migration priority matrix

| Priority | Area | Rationale |
|----------|------|-----------|
| P0 | Backend for LLM + doctors APIs | App is non-functional without dev Vite plugins |
| P1 | Appointments + nearby doctors | Highest layout + native capability overlap |
| P1 | Dashboard | First screen users see; most density |
| P2 | Hypotheses + assistant chat | LLM UX + drawer pattern |
| P2 | Journal forms/modals | Core data entry |
| P3 | Profile/anamnesis/recommendations | Important but fewer layout constraints |
| P3 | Notifications, settings, i18n | Mostly polish |

**Easiest wins for Capacitor shell:** wrap existing Vue build in WebView for Journal + basic navigation first, while deferring map and AI features until backend exists.
