import { db } from '@/db/database'

export const SNAPSHOT_FORMAT_VERSION = 1

export const SNAPSHOT_TABLES = [
  'clinicalModels',
  'timelineEvents',
  'hypotheses',
  'healthEntries',
  'patientProfiles',
  'appointments',
] as const

export type SnapshotTableName = (typeof SNAPSHOT_TABLES)[number]

export interface MondayDbSnapshot {
  formatVersion: number
  databaseName: string
  exportedAt: string
  tables: Record<SnapshotTableName, unknown[]>
}

async function readTable(name: SnapshotTableName): Promise<unknown[]> {
  const table = db.table(name)
  return table.toArray()
}

export async function exportDbSnapshot(): Promise<MondayDbSnapshot> {
  const tables = {} as Record<SnapshotTableName, unknown[]>

  for (const name of SNAPSHOT_TABLES) {
    tables[name] = await readTable(name)
  }

  return {
    formatVersion: SNAPSHOT_FORMAT_VERSION,
    databaseName: db.name,
    exportedAt: new Date().toISOString(),
    tables,
  }
}

export async function importDbSnapshot(
  snapshot: MondayDbSnapshot,
  options: { replace?: boolean } = {}
): Promise<{ replacedTables: SnapshotTableName[] }> {
  if (snapshot.formatVersion !== SNAPSHOT_FORMAT_VERSION) {
    throw new Error(
      `Unsupported snapshot format version ${snapshot.formatVersion} (expected ${SNAPSHOT_FORMAT_VERSION}).`
    )
  }

  const replace = options.replace !== false
  const replacedTables: SnapshotTableName[] = []

  await db.transaction('rw', SNAPSHOT_TABLES, async () => {
    for (const name of SNAPSHOT_TABLES) {
      const rows = snapshot.tables[name]
      if (!Array.isArray(rows)) {
        throw new Error(`Snapshot is missing table "${name}".`)
      }

      if (replace) {
        await db.table(name).clear()
      }

      if (rows.length > 0) {
        await db.table(name).bulkPut(rows as never[])
      }

      replacedTables.push(name)
    }
  })

  return { replacedTables }
}

export function downloadSnapshotJson(snapshot: MondayDbSnapshot, filename?: string): void {
  const stamp = snapshot.exportedAt.replace(/[:.]/g, '-')
  const name = filename ?? `monday-db-${stamp}.json`
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

export function snapshotSummary(snapshot: MondayDbSnapshot): string {
  const counts = SNAPSHOT_TABLES.map(
    (name) => `${name}: ${snapshot.tables[name]?.length ?? 0}`
  )
  return `${snapshot.exportedAt}\n${counts.join('\n')}`
}
