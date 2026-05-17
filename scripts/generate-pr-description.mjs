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
  const refs = new Set([
    'origin/develop',
    'develop',
    'origin/main',
    'main',
  ])

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

/**
 * The branch we likely forked from has the smallest gap between merge-base and its tip.
 */
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

  const candidates = collectBranchCandidates(current)
  const fromFork = detectForkParent(candidates)
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
    'App shell': [],
    Config: [],
    Other: [],
  }

  for (const file of files) {
    if (file.startsWith('src/db/')) groups['Database & persistence'].push(file)
    else if (file.startsWith('src/api/')) groups['API layer'].push(file)
    else if (file.startsWith('src/components/')) groups.Components.push(file)
    else if (file.startsWith('src/views/')) groups.Views.push(file)
    else if (file.startsWith('src/models/') || file.startsWith('src/services/'))
      groups['Models & types'].push(file)
    else if (file.startsWith('src/router/')) groups.Router.push(file)
    else if (file === 'src/App.vue' || file === 'src/main.ts')
      groups['App shell'].push(file)
    else if (
      file.endsWith('.json') ||
      file.includes('vite.config') ||
      file.includes('tsconfig')
    )
      groups.Config.push(file)
    else groups.Other.push(file)
  }

  return Object.entries(groups).filter(([, list]) => list.length > 0)
}

function inferHighlights(files, commits) {
  const highlights = []
  const all = files.join('\n').toLowerCase()
  const msgs = commits.join('\n').toLowerCase()

  if (all.includes('src/db/') || all.includes('dexie') || msgs.includes('indexeddb'))
    highlights.push('Local IndexedDB persistence (Dexie) — data stays on-device')
  if (all.includes('healthentry') || all.includes('healthlog') || msgs.includes('journal'))
    highlights.push('Health journal form for longitudinal symptom and treatment notes')
  if (all.includes('healthanalysis') || all.includes('healthapi'))
    highlights.push('On-device analysis (urgency, flags, clinical summary) on each journal entry')
  if (all.includes('timeline'))
    highlights.push('Journal entries synced to the medical timeline')
  if (all.includes('mockapi'))
    highlights.push('API layer refactored to read/write from local database instead of in-memory mocks')

  if (highlights.length === 0 && commits.length > 0) {
    highlights.push(commits[0])
  }
  if (highlights.length === 0) {
    highlights.push('See changed files below.')
  }

  return highlights
}

function buildTestPlan(files) {
  const checks = [
    'Run `npm install` and `npm run dev`',
    'Confirm the app loads without console errors',
  ]

  if (files.some((f) => f.includes('src/db/'))) {
    checks.push(
      'Verify IndexedDB (`MondayDB`) in DevTools → Application after first load'
    )
  }
  if (files.some((f) => f.includes('HealthEntry') || f.includes('HealthLog'))) {
    checks.push('Open **Journal**, submit an entry, and confirm it appears in the list')
    checks.push(
      'Confirm a matching event appears on **Timeline** after saving a journal entry'
    )
    checks.push('Reload the app and confirm data persists')
  }
  if (files.some((f) => f.includes('mockApi') || f.includes('healthApi'))) {
    checks.push('Confirm no network requests when loading or saving data (Network tab)')
  }

  return checks
}

function main() {
  const branch = run('git branch --show-current') || 'unknown'
  const base = resolveBaseBranch()
  const commitLines = run(`git log ${base}..HEAD --pretty=format:%s`).split('\n').filter(Boolean)
  const fileList = run(`git diff ${base}...HEAD --name-only`).split('\n').filter(Boolean)
  const grouped = groupFiles(fileList)
  const highlights = inferHighlights(fileList, commitLines)
  const testPlan = buildTestPlan(fileList)
  const generatedAt = new Date().toISOString()

  const title =
    commitLines.length > 0
      ? commitLines[0]
      : `Update from ${branch}`

  let md = `# Pull request: ${title}

> Auto-generated before push at \`${generatedAt}\`  
> Branch: \`${branch}\` → base: \`${base}\`  
> Copy this file into your GitHub PR description.

## Summary

`

  for (const item of highlights) {
    md += `- ${item}\n`
  }

  if (commitLines.length > 1) {
    md += `\n### Commits (${commitLines.length})\n\n`
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

*This file is gitignored and regenerated on every \`git push\`.*
`

  writeFileSync(OUTPUT, md, 'utf8')
  console.log(`Updated ${OUTPUT}`)
}

main()
