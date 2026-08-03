/**
 * Test end-to-end du téléchargement gaté par code à usage unique.
 *
 * Prérequis : `npm run build` déjà exécuté.
 * Usage     : node scripts/test-download-flow.mjs
 *
 * Le script démarre son propre serveur `next start` sur un port dédié, avec une
 * base SQLite temporaire, puis déroule le flux complet :
 *   seed → issue → redeem → download, et tous les cas d'échec attendus.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const PORT = 3099
const BASE = `http://127.0.0.1:${PORT}`
const KEY = 'test-internal-key-do-not-use-in-prod'
const ROOT = process.cwd()
const ZIP = path.join(ROOT, 'private-assets', 'ADA-v7.zip')

const workDir = mkdtempSync(path.join(tmpdir(), 'ada-codes-test-'))
const DB_PATH = path.join(workDir, 'codes.db')

let passed = 0
let failed = 0

function check(label, condition, detail = '') {
  if (condition) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (res.status < 500) return true
    } catch {
      // serveur pas encore prêt
    }
    await new Promise(r => setTimeout(r, 400))
  }
  return false
}

// Garde-fou : si le port est déjà occupé (serveur orphelin d'un run précédent),
// on refuse de continuer. Sinon les requêtes partiraient vers l'ancien serveur,
// branché sur une autre base — les tests passeraient sans rien prouver.
await new Promise((resolve, reject) => {
  const probe = createServer()
  probe.once('error', err =>
    reject(
      err.code === 'EADDRINUSE'
        ? new Error(`port ${PORT} déjà utilisé — lancer : node scripts/kill-port.mjs ${PORT}`)
        : err
    )
  )
  probe.once('listening', () => probe.close(resolve))
  probe.listen(PORT, '127.0.0.1')
}).catch(err => {
  console.error(`\nERREUR : ${err.message}`)
  rmSync(workDir, { recursive: true, force: true })
  process.exit(1)
})

// `detached: true` → le serveur devient chef de groupe de processus, ce qui
// permet de tuer TOUT le groupe. Sans ça, tuer le wrapper npx laisse un
// `next start` orphelin qui garde le port : le run suivant interroge alors le
// vieux serveur (et sa vieille base) au lieu du neuf — faux positifs garantis.
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    INTERNAL_API_KEY: KEY,
    CODES_DB_PATH: DB_PATH,
    DOWNLOAD_FILE_PATH: ZIP,
    DOWNLOAD_TOKEN_TTL_SECONDS: '60',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
})
server.stdout.on('data', () => {})
server.stderr.on('data', () => {})

function cleanup() {
  try {
    process.kill(-server.pid, 'SIGKILL') // tout le groupe
  } catch {
    /* déjà mort */
  }
  try {
    rmSync(workDir, { recursive: true, force: true })
  } catch {
    /* rien à nettoyer */
  }
}
process.on('exit', cleanup)
process.on('SIGINT', () => process.exit(130))

const internal = (p, body) =>
  fetch(`${BASE}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': KEY },
    body: JSON.stringify(body ?? {}),
  })

const redeem = code =>
  fetch(`${BASE}/api/download/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

try {
  console.log(`\nDB temporaire : ${DB_PATH}`)
  console.log('Démarrage du serveur…')
  if (!await waitForServer()) throw new Error('le serveur n’a pas démarré')
  console.log(`Serveur prêt sur ${BASE}\n`)

  // ── 1. Le zip ne doit plus être servi statiquement ─────────────────────────
  console.log('1) Le zip n’est plus accessible statiquement')
  for (const p of ['/ADA-v7.zip', '/private-assets/ADA-v7.zip', '/../private-assets/ADA-v7.zip']) {
    const res = await fetch(`${BASE}${p}`, { redirect: 'manual' })
    check(`GET ${p} → ${res.status} (attendu 404)`, res.status === 404)
  }

  // ── 2. Auth des endpoints internes ────────────────────────────────────────
  console.log('\n2) Auth des endpoints internes')
  for (const p of ['/api/internal/codes/seed', '/api/internal/codes/issue']) {
    const noKey = await fetch(`${BASE}${p}`, { method: 'POST' })
    check(`POST ${p} sans clé → 401`, noKey.status === 401)
    const badKey = await fetch(`${BASE}${p}`, {
      method: 'POST',
      headers: { 'x-internal-key': 'wrong-key' },
    })
    check(`POST ${p} clé invalide → 401`, badKey.status === 401)
  }

  // ── 3. Seed ───────────────────────────────────────────────────────────────
  console.log('\n3) Seed du pool')
  const seedRes = await internal('/api/internal/codes/seed', { count: 500 })
  const seedBody = await seedRes.json()
  check('seed → 200', seedRes.status === 200, JSON.stringify(seedBody))
  check('500 codes insérés', seedBody.inserted === 500, JSON.stringify(seedBody))
  check('aucun code en clair dans la réponse', !JSON.stringify(seedBody).match(/[A-Z2-9]{4}-[A-Z2-9]{4}/))

  const reseed = await internal('/api/internal/codes/seed', { count: 10 })
  check('re-seed sans force → 409 (pas de double-seed)', reseed.status === 409)

  // ── 4. Issue ──────────────────────────────────────────────────────────────
  console.log('\n4) Réservation d’un code')
  const issueRes = await internal('/api/internal/codes/issue')
  const { code } = await issueRes.json()
  check('issue → 200', issueRes.status === 200)
  check(`format XXXX-XXXX-XXXX-XXXX (${code})`, /^[A-HJ-KM-NP-Z2-9]{4}(-[A-HJ-KM-NP-Z2-9]{4}){3}$/.test(code ?? ''))

  const db = new DatabaseSync(DB_PATH)
  const issuedRow = db.prepare('SELECT status FROM codes WHERE code = ?').get(code)
  check('statut passé à "issued" en base', issuedRow?.status === 'issued')

  // Un code jamais réservé (statut 'unused') ne doit PAS être consommable.
  const unusedCode = String(db.prepare("SELECT code FROM codes WHERE status='unused' LIMIT 1").get().code)
  db.close()

  // ── 5. Un code 'unused' n'est pas consommable ─────────────────────────────
  console.log('\n5) Un code non réservé (unused) est refusé')
  const unusedRes = await redeem(unusedCode)
  const unusedBody = await unusedRes.json()
  check('redeem d’un code "unused" → 400', unusedRes.status === 400)
  check('message générique', unusedBody.error === 'Code invalide ou déjà utilisé.', unusedBody.error)

  // ── 6. Codes inconnus / malformés : même message ───────────────────────────
  console.log('\n6) Anti-énumération : message identique dans tous les cas')
  const unknown = await (await redeem('ZZZZ-ZZZZ-ZZZZ-ZZZZ')).json()
  const malformed = await (await redeem('nope')).json()
  check('code inconnu → même message', unknown.error === unusedBody.error, unknown.error)
  check('code malformé → même message', malformed.error === unusedBody.error, malformed.error)

  // ── 7. Redemption valide ──────────────────────────────────────────────────
  console.log('\n7) Redemption du code réservé')
  const okRes = await redeem(code)
  const okBody = await okRes.json()
  check('redeem → 200 ok:true', okRes.status === 200 && okBody.ok === true, JSON.stringify(okBody))
  check('downloadToken présent', typeof okBody.downloadToken === 'string' && okBody.downloadToken.length > 20)
  check('expiresIn = 60', okBody.expiresIn === 60, String(okBody.expiresIn))

  // ── 8. Le code est supprimé définitivement ────────────────────────────────
  console.log('\n8) Le code est supprimé (2e usage impossible)')
  const secondRes = await redeem(code)
  const secondBody = await secondRes.json()
  check('2e redeem du même code → 400', secondRes.status === 400)
  check('message générique', secondBody.error === unusedBody.error)

  const db2 = new DatabaseSync(DB_PATH)
  const goneRow = db2.prepare('SELECT code FROM codes WHERE code = ?').get(code)
  db2.close()
  check('ligne absente de la base', goneRow === undefined)

  // ── 9. Téléchargement avec jeton valide ───────────────────────────────────
  console.log('\n9) Téléchargement via jeton')
  const token = okBody.downloadToken
  const dl = await fetch(`${BASE}/api/download/file?token=${encodeURIComponent(token)}`)
  const expectedSize = statSync(ZIP).size
  const buf = Buffer.from(await dl.arrayBuffer())
  check('download → 200', dl.status === 200)
  check('Content-Type: application/zip', dl.headers.get('content-type') === 'application/zip')
  check(
    'Content-Disposition attachment',
    (dl.headers.get('content-disposition') ?? '').includes('attachment; filename="ADA-v7.zip"'),
    dl.headers.get('content-disposition') ?? ''
  )
  check(`taille identique au fichier source (${expectedSize} octets)`, buf.length === expectedSize, `reçu ${buf.length}`)
  check('signature ZIP (PK\\x03\\x04)', buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04)

  // ── 10. Jeton à usage unique ──────────────────────────────────────────────
  console.log('\n10) Jeton à usage unique')
  const reuse = await fetch(`${BASE}/api/download/file?token=${encodeURIComponent(token)}`)
  check('réutilisation du jeton → 410', reuse.status === 410)
  const noToken = await fetch(`${BASE}/api/download/file`)
  check('sans jeton → 410', noToken.status === 410)
  const badToken = await fetch(`${BASE}/api/download/file?token=forged-token-value`)
  check('jeton forgé → 410', badToken.status === 410)

  // ── 11. Rate-limit ────────────────────────────────────────────────────────
  console.log('\n11) Rate-limit sur /redeem (10 req/min/IP)')
  let got429 = false
  let statuses = []
  for (let i = 0; i < 14; i++) {
    const r = await redeem('AAAA-AAAA-AAAA-AAAA')
    statuses.push(r.status)
    if (r.status === 429) {
      got429 = true
      break
    }
  }
  check('429 déclenché après ~10 tentatives', got429, `statuts: ${statuses.join(',')}`)

  // ── 12. Pool épuisé → 503 ─────────────────────────────────────────────────
  console.log('\n12) Pool épuisé → 503')
  const drainDb = new DatabaseSync(DB_PATH)
  drainDb.exec("DELETE FROM codes WHERE status='unused'")
  drainDb.close()
  const exhausted = await internal('/api/internal/codes/issue')
  check('issue sur pool vide → 503', exhausted.status === 503, String(exhausted.status))
} catch (err) {
  failed++
  console.error(`\nERREUR FATALE : ${err.message}`)
} finally {
  cleanup()
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`Résultat : ${passed} réussis, ${failed} échoués`)
console.log('─'.repeat(60))
process.exit(failed === 0 ? 0 : 1)
