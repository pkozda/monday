# Local database snapshots

IndexedDB data from the Monday app (`MondayDB` in the browser) can be exported here for backups.

This folder is **gitignored** — snapshots stay on your machine only.

## Create a snapshot

1. Start the dev server: `npm run dev`
2. Open the app in the browser (same machine).
3. Run:

```bash
npm run db:snapshot
```

A JSON file is written here, e.g. `monday-db-2025-11-24T10-30-00-000Z.json`.

## Restore a snapshot

```bash
npm run db:snapshot -- restore              # latest file in this folder
npm run db:snapshot -- restore --file NAME.json
```

Confirm in the browser when prompted. The page reloads after restore.

## List snapshots

```bash
npm run db:snapshot -- list
```

## Browser console (dev)

```js
await exportMondayDbSnapshot()           // returns JSON object
await importMondayDbSnapshot(snapshot)   // replace all tables
```

## Contents

Each snapshot includes:

- `healthEntries`, `timelineEvents`, `hypotheses`
- `patientProfiles`, `appointments`, `clinicalModels`
