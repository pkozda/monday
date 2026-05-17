# Monday - Health Platform Frontend MVP

A privacy-first health platform focused on longitudinal medical memory, system-level thinking, and hypothesis-driven analysis.

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript**
- **Vite** for build tooling
- **Vue Router** for navigation
- Plain CSS for styling

## Project Structure

```
src/
 ├─ api/
 │   └─ mockApi.ts          # Mock backend API layer
 ├─ components/
 │   ├─ SectionHeader.vue
 │   ├─ MedicalCard.vue
 │   ├─ TimelineEvent.vue
 │   └─ HypothesisCard.vue
 ├─ views/
 │   ├─ Dashboard.vue
 │   ├─ Timeline.vue
 │   └─ Hypotheses.vue
 ├─ models/
 │   └─ types.ts             # TypeScript data models
 ├─ router/
 │   └─ index.ts             # Vue Router configuration
 ├─ App.vue
 └─ main.ts
```

## Features

### Dashboard
- Current Clinical Model overview
- Key Conditions section
- Active Hypotheses preview

### Medical Timeline
- Chronological list of medical events
- Event types: diagnosis, imaging, symptom, treatment
- Date-formatted display

### Hypotheses View
- List of all health hypotheses
- Confidence levels: Exploratory, Supported, Strongly Supported
- Evidence item counts

## Mock API

All data comes from `/src/api/mockApi.ts` which simulates a backend with:
- `getClinicalModel()` - Returns current clinical model
- `getTimeline()` - Returns chronological medical events
- `getHypotheses()` - Returns all hypotheses

All functions return `Promise<T>` with artificial delays to simulate network requests.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Design Principles

- **Extensibility**: Clean separation of concerns, easy to add real backend
- **Clarity**: Readable code, explicit data models
- **Minimal**: No over-engineering, only what's needed for MVP
- **Type Safety**: Full TypeScript coverage

## Next Steps

When ready to connect to a real backend:
1. Replace functions in `mockApi.ts` with actual HTTP calls
2. Add error handling and loading states
3. Implement authentication if needed
4. Add data persistence layer
