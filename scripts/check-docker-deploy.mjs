/**
 * Vérifie le déploiement Docker : archive embarquée hors de public/, droits
 * d'écriture SQLite (WAL) pour l'utilisateur non-root, et persistance du volume.
 *
 * Prérequis : conteneur démarré, ex.
 *   docker build -t ada-web-codes-test .
 *   docker run -d --name ada-web-codes-run -p 3097:3002 \
 *     -e INTERNAL_API_KEY=docker-test-key -v ada-test-vol:/app/data ada-web-codes-test
 *
 * Usage : node scripts/check-docker-deploy.mjs [container] [port] [key]
 */
import { execFileSync } from 'node:child_process'

const CONTAINER = process.argv[2] ?? 'ada-web-codes-run'
const PORT = process.argv[3] ?? '3097'
const KEY = process.argv[4] ?? 'docker-test-key'
const BASE = `http://127.0.0.1:${PORT}`

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}
const sh = args => execFileSync('docker', args, { encoding: 'utf8' }).trim()

try {
  // ── Attente de disponibilité ───────────────────────────────────────────────
  const deadline = Date.now() + 60_000
  let ready = false
  while (Date.now() < deadline && !ready) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      ready = r.status === 200
    } catch {
      /* pas prêt */
    }
    if (!ready) await new Promise(r => setTimeout(r, 500))
  }
  check('page d’accueil répond 200', ready)
  if (!ready) throw new Error('conteneur non disponible')

  // ── Utilisateur & permissions ──────────────────────────────────────────────
  console.log('\nUtilisateur et permissions dans le conteneur')
  const id = sh(['exec', CONTAINER, 'id'])
  check(`conteneur non-root (${id})`, id.includes('uid=1001') && id.includes('adaweb'), id)

  const lsData = sh(['exec', CONTAINER, 'ls', '-ld', '/app/data'])
  check(`/app/data appartient à adaweb (${lsData})`, lsData.includes('adaweb'), lsData)

  const lsZip = sh(['exec', CONTAINER, 'ls', '-l', '/app/private-assets/ADA-v7.zip'])
  check('archive présente dans /app/private-assets', lsZip.includes('ADA-v7.zip'), lsZip)

  // L'archive ne doit PAS avoir été copiée dans public/
  const publicZip = sh([
    'exec',
    CONTAINER,
    'sh',
    '-c',
    'ls /app/public/ADA-v7.zip 2>/dev/null || echo ABSENT',
  ])
  check('archive absente de /app/public', publicZip.includes('ABSENT'), publicZip)

  // ── Le zip n'est pas servi statiquement ────────────────────────────────────
  console.log('\nAccès statique interdit')
  for (const p of ['/ADA-v7.zip', '/private-assets/ADA-v7.zip']) {
    const r = await fetch(`${BASE}${p}`, { redirect: 'manual' })
    check(`GET ${p} → ${r.status} (attendu 404)`, r.status === 404)
  }

  // ── Flux complet : écriture SQLite réelle sous l'utilisateur non-root ──────
  console.log('\nFlux complet dans le conteneur (écriture SQLite + WAL)')
  const seed = await fetch(`${BASE}/api/internal/codes/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': KEY },
    body: JSON.stringify({ count: 50 }),
  })
  const seedBody = await seed.json()
  check('seed → 200 (écriture SQLite OK sous adaweb)', seed.status === 200, JSON.stringify(seedBody))

  const issue = await fetch(`${BASE}/api/internal/codes/issue`, {
    method: 'POST',
    headers: { 'x-internal-key': KEY },
  })
  const { code } = await issue.json()
  check(`issue → code réservé (${code})`, issue.status === 200 && typeof code === 'string')

  const red = await fetch(`${BASE}/api/download/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const redBody = await red.json()
  check('redeem → 200 ok:true', red.status === 200 && redBody.ok === true, JSON.stringify(redBody))

  const dl = await fetch(`${BASE}/api/download/file?token=${encodeURIComponent(redBody.downloadToken)}`)
  const buf = Buffer.from(await dl.arrayBuffer())
  check('download → 200', dl.status === 200)
  check(`archive servie (${buf.length} octets, signature ZIP)`, buf[0] === 0x50 && buf[1] === 0x4b)

  // ── WAL effectivement actif sur le volume ─────────────────────────────────
  console.log('\nFichiers SQLite sur le volume')
  const lsVol = sh(['exec', CONTAINER, 'ls', '-l', '/app/data'])
  check('codes.db présent', lsVol.includes('codes.db'), lsVol)
  check('journal WAL actif (codes.db-wal)', lsVol.includes('codes.db-wal'), lsVol)

  console.log(`\n${lsVol}`)
} catch (err) {
  failed++
  console.error(`ERREUR : ${err.message}`)
}

console.log(`\n${failed === 0 ? 'DOCKER OK' : `${failed} ÉCHEC(S)`}`)
process.exit(failed === 0 ? 0 : 1)
