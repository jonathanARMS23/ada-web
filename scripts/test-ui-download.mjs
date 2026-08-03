/**
 * Test navigateur de la pop-up de téléchargement (Playwright/Chromium).
 *
 * Vérifie sur /docs/installation :
 *   - les boutons n'exposent plus de lien direct vers l'archive
 *   - la pop-up s'ouvre et demande un code
 *   - un mauvais code affiche l'erreur générique
 *   - un bon code déclenche le téléchargement réel du zip
 *
 * Prérequis : `npm run build`.
 * Usage     : node scripts/test-ui-download.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const PORT = 3096
const BASE = `http://127.0.0.1:${PORT}`
const KEY = 'ui-test-key'
const ROOT = process.cwd()
const ZIP = path.join(ROOT, 'private-assets', 'ADA-v7.zip')
const workDir = mkdtempSync(path.join(tmpdir(), 'ada-ui-test-'))

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

// Port libre ? (évite d'interroger un serveur orphelin)
await new Promise((resolve, reject) => {
  const probe = createServer()
  probe.once('error', e =>
    reject(
      e.code === 'EADDRINUSE'
        ? new Error(`port ${PORT} occupé — node scripts/kill-port.mjs ${PORT}`)
        : e
    )
  )
  probe.once('listening', () => probe.close(resolve))
  probe.listen(PORT, '127.0.0.1')
}).catch(e => {
  console.error(`ERREUR : ${e.message}`)
  process.exit(1)
})

const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    INTERNAL_API_KEY: KEY,
    CODES_DB_PATH: path.join(workDir, 'codes.db'),
    DOWNLOAD_FILE_PATH: ZIP,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
})
server.stdout.on('data', () => {})
server.stderr.on('data', () => {})

const cleanup = () => {
  try {
    process.kill(-server.pid, 'SIGKILL')
  } catch {
    /* déjà mort */
  }
  rmSync(workDir, { recursive: true, force: true })
}
process.on('exit', cleanup)

let browser
try {
  const deadline = Date.now() + 60_000
  for (;;) {
    if (Date.now() > deadline) throw new Error('serveur non démarré')
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (r.status === 200) break
    } catch {
      /* pas prêt */
    }
    await new Promise(r => setTimeout(r, 400))
  }

  // Prépare un code valide via les endpoints internes.
  await fetch(`${BASE}/api/internal/codes/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': KEY },
    body: JSON.stringify({ count: 20 }),
  })
  const { code } = await (
    await fetch(`${BASE}/api/internal/codes/issue`, {
      method: 'POST',
      headers: { 'x-internal-key': KEY },
    })
  ).json()

  browser = await chromium.launch()
  const context = await browser.newContext({ acceptDownloads: true })
  const page = await context.newPage()
  await page.goto(`${BASE}/docs/installation`, { waitUntil: 'networkidle' })

  // ── 1. Plus aucun lien direct vers l'archive ───────────────────────────────
  console.log('\n1) Aucun lien direct vers l’archive dans le HTML')
  const directLinks = await page.locator('a[href*="ADA-v7.zip"], a[download]').count()
  check(`0 lien <a> vers le zip (trouvés : ${directLinks})`, directLinks === 0)

  // ── 2. La pop-up s'ouvre ───────────────────────────────────────────────────
  console.log('\n2) Ouverture de la pop-up')
  const dlButtons = page.getByRole('button', { name: /Télécharger ADA-v7\.zip/i })
  const nbButtons = await dlButtons.count()
  check(`boutons de téléchargement présents (${nbButtons})`, nbButtons >= 1)

  await dlButtons.first().click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible', timeout: 5000 })
  check('pop-up visible', await dialog.isVisible())
  check(
    'titre « Code de téléchargement requis »',
    await dialog.getByText(/Code de téléchargement requis/i).isVisible()
  )

  const input = dialog.getByPlaceholder('XXXX-XXXX-XXXX-XXXX')
  check('champ code présent', await input.isVisible())

  // ── 3. Mauvais code → erreur générique ─────────────────────────────────────
  console.log('\n3) Code invalide')
  await input.fill('ZZZZ-ZZZZ-ZZZZ-ZZZZ')
  await dialog.getByRole('button', { name: /Débloquer/i }).click()
  const alert = dialog.getByRole('alert')
  await alert.waitFor({ state: 'visible', timeout: 5000 })
  const alertText = (await alert.textContent())?.trim()
  check(`message générique affiché (« ${alertText} »)`, alertText === 'Code invalide ou déjà utilisé.')
  check('pop-up toujours ouverte', await dialog.isVisible())

  // ── 4. Bon code → téléchargement réel ──────────────────────────────────────
  console.log('\n4) Code valide → téléchargement')
  await input.fill(code)
  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 })
  await dialog.getByRole('button', { name: /Débloquer/i }).click()
  const download = await downloadPromise

  check(`nom de fichier proposé : ${download.suggestedFilename()}`, download.suggestedFilename() === 'ADA-v7.zip')
  const saved = path.join(workDir, 'downloaded.zip')
  await download.saveAs(saved)
  const size = statSync(saved).size
  check(`taille identique à l’archive source (${size} octets)`, size === statSync(ZIP).size)

  // ── 5. Le code est consommé ────────────────────────────────────────────────
  console.log('\n5) Le code est consommé (non réutilisable)')
  const again = await fetch(`${BASE}/api/download/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  check('réutilisation du même code → 400', again.status === 400)

  // ── 6. Fermeture par Échap ─────────────────────────────────────────────────
  console.log('\n6) Ergonomie')
  await page.goto(`${BASE}/docs`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Download v7\.3\.0/i }).first().click()
  const dialog2 = page.getByRole('dialog')
  await dialog2.waitFor({ state: 'visible', timeout: 5000 })
  check('pop-up ouverte depuis la home des docs', await dialog2.isVisible())
  await page.keyboard.press('Escape')
  await dialog2.waitFor({ state: 'detached', timeout: 5000 })
  check('fermeture au clavier (Échap)', (await page.getByRole('dialog').count()) === 0)
} catch (err) {
  failed++
  console.error(`\nERREUR : ${err.message}`)
} finally {
  if (browser) await browser.close()
}

console.log(`\n${failed === 0 ? 'UI OK' : `${failed} ÉCHEC(S)`}`)
process.exit(failed === 0 ? 0 : 1)
