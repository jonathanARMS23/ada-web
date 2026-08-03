/**
 * Vérifie que le pool de codes SURVIT à la recréation du conteneur,
 * c'est-à-dire que le volume Docker persistant fait bien son travail.
 *
 * À lancer après avoir supprimé puis recréé le conteneur avec le MÊME volume.
 * Usage : node scripts/check-volume-persistence.mjs [port] [key] [expectedRemaining]
 */
const PORT = process.argv[2] ?? '3097'
const KEY = process.argv[3] ?? 'docker-test-key'
const BASE = `http://127.0.0.1:${PORT}`

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

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
check('nouveau conteneur répond 200', ready)

if (ready) {
  // Le seed doit être REFUSÉ : la table contient déjà les codes du volume.
  // C'est la preuve que les données ont survécu à la recréation.
  const res = await fetch(`${BASE}/api/internal/codes/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': KEY },
    body: JSON.stringify({ count: 10 }),
  })
  const body = await res.json()
  check('seed refusé → 409 (pool déjà présent)', res.status === 409, JSON.stringify(body))
  check(
    `codes préservés après recréation (existing=${body.existing})`,
    typeof body.existing === 'number' && body.existing > 0,
    JSON.stringify(body)
  )

  // Et un code du pool persisté est toujours réservable.
  const issue = await fetch(`${BASE}/api/internal/codes/issue`, {
    method: 'POST',
    headers: { 'x-internal-key': KEY },
  })
  const issued = await issue.json()
  check(`issue fonctionne sur le pool persisté (${issued.code})`, issue.status === 200 && !!issued.code)
}

console.log(`\n${failed === 0 ? 'PERSISTANCE OK' : `${failed} ÉCHEC(S)`}`)
process.exit(failed === 0 ? 0 : 1)
