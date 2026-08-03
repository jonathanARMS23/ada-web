/**
 * Vérifie le seed réel de 100 000 codes : durée, unicité, entropie.
 *
 * Prérequis : `npm run build`.
 * Usage     : node scripts/test-seed-100k.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const PORT = 3098
const BASE = `http://127.0.0.1:${PORT}`
const KEY = 'test-internal-key'
const workDir = mkdtempSync(path.join(tmpdir(), 'ada-seed-100k-'))
const DB_PATH = path.join(workDir, 'codes.db')

// detached → permet de tuer tout le groupe de processus (voir
// test-download-flow.mjs : sinon un `next start` orphelin garde le port).
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production', INTERNAL_API_KEY: KEY, CODES_DB_PATH: DB_PATH },
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
})
server.stdout.on('data', () => {})
server.stderr.on('data', () => {})

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

try {
  const deadline = Date.now() + 60_000
  for (;;) {
    if (Date.now() > deadline) throw new Error('serveur non démarré')
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (r.status < 500) break
    } catch {
      /* pas prêt */
    }
    await new Promise(r => setTimeout(r, 400))
  }

  console.log('\nSeed de 100 000 codes…')
  const t0 = Date.now()
  const res = await fetch(`${BASE}/api/internal/codes/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': KEY },
    body: JSON.stringify({ count: 100000 }),
  })
  const body = await res.json()
  const elapsed = Date.now() - t0

  console.log(`Durée : ${elapsed} ms\n`)
  check('seed → 200', res.status === 200, JSON.stringify(body))
  check('inserted = 100000', body.inserted === 100000, JSON.stringify(body))
  check('pool.unused = 100000', body.pool?.unused === 100000, JSON.stringify(body.pool))
  check(`durée < 30 s (${elapsed} ms)`, elapsed < 30_000)

  const db = new DatabaseSync(DB_PATH)
  const total = Number(db.prepare('SELECT COUNT(*) c FROM codes').get().c)
  const distinct = Number(db.prepare('SELECT COUNT(DISTINCT code) c FROM codes').get().c)
  check(`100000 lignes en base (${total})`, total === 100000)
  check(`tous les codes uniques (${distinct} distincts)`, distinct === total)

  const badFormat = Number(
    db
      .prepare(
        `SELECT COUNT(*) c FROM codes
         WHERE code NOT GLOB '[A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9]-[A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9]-[A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9]-[A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9][A-HJ-KM-NP-Z2-9]'`
      )
      .get().c
  )
  check(`format conforme pour les 100000 codes (${badFormat} non conformes)`, badFormat === 0)

  // Aucun caractère ambigu (0, 1, I, L, O) ne doit apparaître.
  const ambiguous = Number(
    db.prepare(`SELECT COUNT(*) c FROM codes WHERE code GLOB '*[01ILO]*'`).get().c
  )
  check(`aucun caractère ambigu 0/1/I/L/O (${ambiguous} trouvés)`, ambiguous === 0)

  // Distribution des caractères : détecte un biais grossier du générateur.
  const rows = db.prepare('SELECT code FROM codes').all()
  const freq = new Map()
  for (const r of rows) for (const ch of String(r.code).replace(/-/g, '')) freq.set(ch, (freq.get(ch) ?? 0) + 1)
  const counts = [...freq.values()]
  const expected = (100000 * 16) / 31
  const maxDev = Math.max(...counts.map(c => Math.abs(c - expected) / expected))
  check(`31 symboles utilisés (${freq.size})`, freq.size === 31)
  check(`distribution uniforme, écart max ${(maxDev * 100).toFixed(2)}% < 5%`, maxDev < 0.05)
  db.close()
} catch (err) {
  failed++
  console.error(`ERREUR : ${err.message}`)
} finally {
  try {
    process.kill(-server.pid, 'SIGKILL') // tout le groupe
  } catch {
    /* déjà mort */
  }
  rmSync(workDir, { recursive: true, force: true })
}

console.log(`\n${failed === 0 ? 'TOUT OK' : `${failed} ÉCHEC(S)`}`)
process.exit(failed === 0 ? 0 : 1)
