#!/usr/bin/env node
/**
 * Generates .pr-description.md from commits and diff vs the base branch.
 * Run automatically via .githooks/pre-push before every git push.
 */

import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT = join(ROOT, '.pr-description.md')

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function hashSeed(...parts) {
  const s = parts.join('|')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pick(pool, seed) {
  return pool[seed % pool.length]
}

function getBranchFromReflog(currentBranch) {
  const messages = run(`git reflog show ${currentBranch} --format=%gs`)
  if (!messages) return null

  for (const line of messages.split('\n')) {
    const match = line.match(/^branch: Created from (.+)$/)
    if (!match) continue
    const source = match[1].trim()
    if (source === 'HEAD') continue
    if (run(`git rev-parse --verify ${source}`)) return source
  }
  return null
}

function collectBranchCandidates(currentBranch) {
  const refs = new Set(['origin/develop', 'develop', 'origin/main', 'main'])

  for (const local of run(
    "git for-each-ref --format='%(refname:short)' refs/heads/"
  )
    .split('\n')
    .filter(Boolean)) {
    if (local !== currentBranch) refs.add(local)
  }

  for (const remote of run(
    "git for-each-ref --format='%(refname:short)' refs/remotes/origin/"
  )
    .split('\n')
    .filter(Boolean)) {
    if (remote !== 'origin/HEAD') refs.add(remote)
  }

  return [...refs].filter((ref) => run(`git rev-parse --verify ${ref}`))
}

function detectForkParent(candidates) {
  let best = null
  let minDistance = Infinity

  for (const candidate of candidates) {
    const mergeBase = run(`git merge-base HEAD ${candidate}`)
    if (!mergeBase) continue
    const distance = parseInt(
      run(`git rev-list --count ${mergeBase}..${candidate}`) || '999999',
      10
    )
    if (distance < minDistance) {
      minDistance = distance
      best = candidate
    }
  }
  return best
}

function resolveBaseBranch() {
  const current = run('git branch --show-current')
  if (!current) return 'HEAD~1'

  const fromReflog = getBranchFromReflog(current)
  if (fromReflog) return fromReflog

  const fromFork = detectForkParent(collectBranchCandidates(current))
  if (fromFork) return fromFork

  for (const ref of ['origin/develop', 'develop', 'origin/main', 'main']) {
    if (run(`git rev-parse --verify ${ref}`)) return ref
  }
  return 'HEAD~1'
}

function groupFiles(files) {
  const groups = {
    'Database & persistence': [],
    'API layer': [],
    Components: [],
    Views: [],
    'Models & types': [],
    Router: [],
    'App shell & styling': [],
    'Tooling & config': [],
    Assets: [],
    Other: [],
  }

  for (const file of files) {
    if (file.startsWith('assets/')) groups.Assets.push(file)
    else if (file.startsWith('src/db/')) groups['Database & persistence'].push(file)
    else if (file.startsWith('src/api/')) groups['API layer'].push(file)
    else if (file.startsWith('src/components/')) groups.Components.push(file)
    else if (file.startsWith('src/views/')) groups.Views.push(file)
    else if (
      file.startsWith('src/models/') ||
      file.startsWith('src/services/') ||
      file.startsWith('src/composables/')
    )
      groups['Models & types'].push(file)
    else if (file.startsWith('src/router/')) groups.Router.push(file)
    else if (
      file.startsWith('src/styles/') ||
      file === 'src/App.vue' ||
      file === 'src/main.ts' ||
      file === 'index.html'
    )
      groups['App shell & styling'].push(file)
    else if (file.startsWith('scripts/') || file.startsWith('.githooks/'))
      groups['Tooling & config'].push(file)
    else if (
      file.endsWith('.json') ||
      file.includes('vite.config') ||
      file.includes('tsconfig') ||
      file === '.gitignore'
    )
      groups['Tooling & config'].push(file)
    else groups.Other.push(file)
  }

  return Object.entries(groups).filter(([, list]) => list.length > 0)
}

/** Feature detectors: each returns bullets when matched (with phrasing variants). */
function detectFeatures(files, commits) {
  const text = `${files.join('\n')}\n${commits.join('\n')}`.toLowerCase()
  const has = (re) => re.test(text)
  const hasFile = (frag) => files.some((f) => f.toLowerCase().includes(frag))
  const seed = hashSeed(files.join(','), commits.join(','))
  const bullets = []

  const add = (pool, priority = 0) => {
    bullets.push({ text: pick(pool, seed + bullets.length + priority), priority })
  }

  if (hasFile('themetoggle') || hasFile('themes.css') || hasFile('usetheme')) {
    add([
      'Dark and light theme support with a nav toggle; preference persists across sessions.',
      'Theme switcher (dark/light) wired through CSS variables so the whole UI updates consistently.',
      'User-selectable dark or light theme, including system-preference fallback on first visit.',
    ])
  }

  if (hasFile('logo.png') || hasFile('background.png') || (hasFile('app.vue') && has(/logo|background/))) {
    add([
      'Branding refresh: logo in the nav and a subtle full-page background from project assets.',
      'Applies `assets/logo.png` and `assets/background.png` with a softened overlay so content stays readable.',
      'Navigation logo and page background image integrated into the app shell.',
    ])
  }

  if (hasFile('dashboard') || hasFile('dashboardstats') || hasFile('patientprofile')) {
    add([
      'Dashboard expanded with patient profile, health statistics, and chart visualizations.',
      'New dashboard overview: editable patient card, stat tiles, and charts driven from journal data.',
      'Patient profile plus analytics charts (severity trend, urgency, entry types) on the dashboard.',
    ])
  }

  if (hasFile('hypothesisgenerator') || hasFile('hypothesisapi')) {
    add([
      '“Generate hypothesis” action analyzes journal data locally and saves a new hypothesis.',
      'Rule-based hypothesis generation from grouped journal entries, with confidence and evidence links.',
      'Dashboard control to derive hypotheses from existing health records without a backend.',
    ])
  }

  if (hasFile('healthentryform') || hasFile('healthlog')) {
    add([
      'Health journal form for logging symptoms, medications, visits, and condition changes over time.',
      'New Journal page with a reusable entry form; each save is analyzed and stored locally.',
      'Longitudinal health notes via the journal UI, linked into the medical timeline.',
    ])
  }

  if (hasFile('translation')) {
    add([
      'Russian input supported in the journal; entries are translated to English before storage.',
      'Cyrillic detection and RU→EN translation so analysis and storage stay in English.',
      'Journal accepts Russian descriptions; translation runs before local save and timeline sync.',
    ])
  }

  if (hasFile('healthanalysis') || hasFile('healthapi')) {
    add([
      'On-device analysis assigns urgency, flags, and a clinical-style summary per journal entry.',
      'Each journal save runs local keyword/severity analysis (no external AI API).',
      'Health entries include automated urgency classification and summary text for clinicians.',
    ])
  }

  if (hasFile('src/db/') || has(/dexie/) || hasFile('database.ts')) {
    add([
      'IndexedDB persistence via Dexie; clinical data and journal entries stay on the device.',
      'Local-first storage layer (`MondayDB`) replaces in-memory mocks for reads and writes.',
      'Dexie schema and APIs for timelines, hypotheses, journal entries, and patient profile.',
    ])
  }

  if (hasFile('seed') && (has(/purge|seed_timeline|seed_hypothesis/) || hasFile('seeddata'))) {
    add([
      'Removes seeded demo timeline/hypothesis data; only user-created journal data remains.',
      'Startup cleanup drops mock timeline and hypothesis rows while keeping journal-derived events.',
      'Seed logic adjusted so Timeline and Hypotheses reflect real user input, not demo fixtures.',
    ])
  }

  if (hasFile('generate-pr-description') || hasFile('.githooks/')) {
    add([
      'Pre-push hook regenerates `.pr-description.md` (gitignored) for copy-paste into GitHub.',
      'Adds PR description generator on `git push` with branch-aware diff against `develop`.',
    ], -1)
  }

  if (hasFile('mockapi') && !bullets.some((b) => b.text.includes('IndexedDB'))) {
    add([
      'API modules updated to read and write through the local database.',
    ])
  }

  return bullets.sort((a, b) => b.priority - a.priority)
}

function buildIntro(commits, files, featureBullets, seed) {
  const count = commits.length
  const fileCount = files.length

  if (count === 1 && commits[0].length > 12) {
    const intros = [
      `This pull request implements **${commits[0]}**.`,
      `Delivers: **${commits[0]}**.`,
      `**${commits[0]}** — changes span \`${fileCount}\` file${fileCount === 1 ? '' : 's'} vs base.`,
    ]
    return pick(intros, seed)
  }

  if (count > 1) {
    const intros = [
      `This pull request bundles **${count} commits** (${fileCount} files changed) focused on ${summarizeFocus(featureBullets)}.`,
      `**${count} commits** on this branch, touching ${fileCount} files — mainly ${summarizeFocus(featureBullets)}.`,
      `Combines ${count} related changes: ${summarizeFocus(featureBullets)}.`,
    ]
    return pick(intros, seed)
  }

  return pick(
    [
      `Updates ${fileCount} file${fileCount === 1 ? '' : 's'} on this branch.`,
      'Branch updates for the Monday health platform frontend.',
    ],
    seed
  )
}

function summarizeFocus(bullets) {
  if (bullets.length === 0) return 'frontend improvements'
  const first = bullets[0].text.split(/[.;]/)[0].toLowerCase()
  if (bullets.length === 1) return first
  return `${first}, plus ${bullets.length - 1} other area${bullets.length === 2 ? '' : 's'}`
}

function buildTitle(commits, files, seed) {
  if (commits.length === 0) return 'Branch update'
  if (commits.length === 1) return commits[0]

  const themes = []
  const t = `${commits.join(' ')} ${files.join(' ')}`.toLowerCase()
  if (/theme|dark|light/.test(t)) themes.push('theming')
  if (/dashboard|chart|patient/.test(t)) themes.push('dashboard')
  if (/hypothesis|journal|health/.test(t)) themes.push('health journal')
  if (/logo|background|style/.test(t)) themes.push('UI')

  if (themes.length > 0) {
    const templates = [
      `${commits[0]} (+${commits.length - 1} commits: ${themes.join(', ')})`,
      `${capitalize(themes.join(' & '))} — ${commits.length} commits`,
      commits[0],
    ]
    return pick(templates, seed)
  }

  return pick(
    [
      `${commits[0]} (+${commits.length - 1} more)`,
      `${commits.length} commits: ${commits[0]}`,
    ],
    seed
  )
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function commitDerivedBullets(commits, existingTexts, seed) {
  const out = []
  const used = new Set(existingTexts.map((t) => t.toLowerCase()))

  for (const msg of commits) {
    const cleaned = msg.trim()
    if (cleaned.length < 8) continue
    if (/^merge /i.test(cleaned)) continue
    if (used.has(cleaned.toLowerCase())) continue

    const lower = cleaned.toLowerCase()
    if (
      lower.includes('fix') ||
      lower.includes('add') ||
      lower.includes('update') ||
      lower.includes('implement') ||
      lower.includes('remove') ||
      lower.includes('refactor')
    ) {
      const formatted =
        cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + (cleaned.endsWith('.') ? '' : '.')
      out.push(pick([formatted, `Commit: ${formatted}`], seed + out.length))
      used.add(cleaned.toLowerCase())
    }
  }

  return out.slice(0, 3)
}

function buildTestPlan(files, commits) {
  const text = files.join('\n').toLowerCase()
  const checks = new Set([
    'Run `npm install` and `npm run dev`',
    'Confirm the app loads without console errors',
  ])

  if (text.includes('src/db/') || text.includes('dexie')) {
    checks.add(
      'Verify IndexedDB (`MondayDB`) in DevTools → Application after first load'
    )
  }
  if (text.includes('healthentry') || text.includes('healthlog')) {
    checks.add(
      'Open **Journal**, submit an entry, and confirm it appears in the list'
    )
    checks.add(
      'Confirm a matching event appears on **Timeline** after saving a journal entry'
    )
    checks.add('Reload the app and confirm data persists')
  }
  if (text.includes('translation')) {
    checks.add(
      'Submit a journal entry in Russian and confirm stored text is English'
    )
  }
  if (text.includes('themetoggle') || text.includes('themes.css')) {
    checks.add('Toggle dark/light theme and confirm styles update across pages')
    checks.add('Reload and confirm theme preference is remembered')
  }
  if (text.includes('hypothesisgenerator')) {
    checks.add(
      'On **Dashboard**, click **Generate hypothesis** with journal data present'
    )
    checks.add('Confirm new hypothesis appears and is listed on **Hypotheses**')
  }
  if (text.includes('dashboard')) {
    checks.add('Open **Dashboard** and verify stats/charts match your journal data')
  }
  if (text.includes('logo.png') || text.includes('background.png')) {
    checks.add('Check nav logo and page background render correctly in both themes')
  }
  if (text.includes('mockapi') || text.includes('healthapi')) {
    checks.add(
      'Confirm no unexpected network calls for local-only flows (Network tab)'
    )
  }
  if (text.includes('seed')) {
    checks.add(
      'Confirm **Timeline** and **Hypotheses** show no old demo data after refresh'
    )
  }

  return [...checks]
}

function main() {
  const branch = run('git branch --show-current') || 'unknown'
  const base = resolveBaseBranch()
  const commitLines = run(`git log ${base}..HEAD --pretty=format:%s`)
    .split('\n')
    .filter(Boolean)
  const fileList = run(`git diff ${base}...HEAD --name-only`)
    .split('\n')
    .filter(Boolean)
  const grouped = groupFiles(fileList)

  const seed = hashSeed(branch, base, commitLines.join('\n'), fileList.join('\n'))
  const featureBullets = detectFeatures(fileList, commitLines)
  const intro = buildIntro(commitLines, fileList, featureBullets, seed)
  const title = buildTitle(commitLines, fileList, seed)

  const summaryBullets = featureBullets.map((b) => b.text)
  const fromCommits = commitDerivedBullets(
    commitLines,
    summaryBullets,
    seed
  )

  const mergedSummary = [...summaryBullets]
  for (const c of fromCommits) {
    if (mergedSummary.length >= 6) break
    if (!mergedSummary.some((s) => s.toLowerCase() === c.toLowerCase())) {
      mergedSummary.push(c)
    }
  }

  if (mergedSummary.length === 0 && commitLines.length > 0) {
    mergedSummary.push(
      pick(
        [
          commitLines[0],
          `Primary change: ${commitLines[0]}`,
        ],
        seed
      )
    )
  }

  const testPlan = buildTestPlan(fileList, commitLines)
  const generatedAt = new Date().toISOString()
  const commitCount = commitLines.length

  let md = `# Pull request: ${title}

> Auto-generated before push at \`${generatedAt}\`  
> Branch: \`${branch}\` → base: \`${base}\` · ${commitCount} commit${commitCount === 1 ? '' : 's'} · ${fileList.length} file${fileList.length === 1 ? '' : 's'}  
> Copy into your GitHub PR description.

## Summary

${intro}

`

  for (const item of mergedSummary.slice(0, 6)) {
    md += `- ${item}\n`
  }

  if (commitCount > 1) {
    md += `\n### Commits in this PR\n\n`
    for (const msg of commitLines) {
      md += `- ${msg}\n`
    }
  }

  if (grouped.length > 0) {
    md += `\n## Changed files\n\n`
    for (const [label, files] of grouped) {
      md += `### ${label}\n\n`
      for (const f of files) {
        md += `- \`${f}\`\n`
      }
      md += '\n'
    }
  }

  md += `## Test plan\n\n`
  for (const check of testPlan) {
    md += `- [ ] ${check}\n`
  }

  md += `
---

*Regenerated on each \`git push\`. Edit freely before opening the PR.*
`

  writeFileSync(OUTPUT, md, 'utf8')
  console.log(`Updated ${OUTPUT}`)
}

main()
