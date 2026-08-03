/**
 * codes-db — stockage SQLite des codes de téléchargement à usage unique.
 *
 * Conventions (alignées sur .claude/coordinator/bank.js d'ADA) :
 *  - node:sqlite (DatabaseSync), zéro dépendance externe
 *  - PRAGMA journal_mode=WAL + busy_timeout=5000 à l'ouverture
 *    (sans ça, des écritures concurrentes peuvent échouer silencieusement)
 *
 * Cycle de vie d'un code : unused --(issue)--> issued --(redeem)--> supprimé.
 * Un code n'est jamais consommable directement depuis 'unused' : il doit avoir
 * été réservé par l'endpoint interne au préalable.
 */
import { DatabaseSync } from 'node:sqlite'
import { randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

// ─── Alphabet & format des codes ─────────────────────────────────────────────
// 31 caractères : A-Z sans I, L, O — chiffres 2-9 (donc sans 0 et 1).
// Évite toute ambiguïté visuelle lors d'une transmission manuelle par email.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const GROUP_LEN = 4
const GROUP_COUNT = 4
const CODE_CHARS = GROUP_LEN * GROUP_COUNT // 16 caractères utiles

// 31^16 ≈ 4,3e23 combinaisons. Avec 100 000 codes en base, la probabilité de
// tomber sur un code valide au hasard est ≈ 2,3e-19 par tentative.
const CODE_REGEX = new RegExp(
  `^[${ALPHABET}]{${GROUP_LEN}}(?:-[${ALPHABET}]{${GROUP_LEN}}){${GROUP_COUNT - 1}}$`
)

export const DEFAULT_SEED_TARGET = 100_000

// ─── Résolution des chemins ──────────────────────────────────────────────────
// `turbopackIgnore` : ces chemins sont résolus au runtime uniquement. Sans ces
// commentaires, le file-tracing (NFT) de `output: 'standalone'` embarque tout
// le projet dans le bundle.
function resolveDbPath(): string {
  const configured = process.env.CODES_DB_PATH?.trim()
  if (configured) return path.resolve(/* turbopackIgnore: true */ configured)
  return path.join(/* turbopackIgnore: true */ process.cwd(), 'data', 'codes.db')
}

// ─── Singleton (survit au HMR de `next dev`) ─────────────────────────────────
type DbGlobal = typeof globalThis & { __adaCodesDb?: DatabaseSync }
const globalDb = globalThis as DbGlobal

function initSchema(db: DatabaseSync): void {
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA busy_timeout = 5000')
  db.exec(`
    CREATE TABLE IF NOT EXISTS codes (
      code       TEXT PRIMARY KEY,
      status     TEXT NOT NULL CHECK(status IN ('unused','issued')) DEFAULT 'unused',
      issued_at  TEXT,
      created_at TEXT NOT NULL
    );
  `)
  // Indispensable : sans index, réserver un code balaye jusqu'à 100k lignes.
  db.exec(`CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);`)

  // Jetons de téléchargement courte durée. Persistés en SQLite plutôt qu'en
  // mémoire : la redemption SUPPRIME le code définitivement, donc perdre le
  // jeton sur un redémarrage enfermerait un client payant dehors.
  db.exec(`
    CREATE TABLE IF NOT EXISTS download_tokens (
      token       TEXT PRIMARY KEY,
      created_at  TEXT NOT NULL,
      expires_at  INTEGER NOT NULL,
      consumed_at TEXT
    );
  `)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tokens_expires ON download_tokens(expires_at);`)
}

export function getDb(): DatabaseSync {
  if (globalDb.__adaCodesDb) return globalDb.__adaCodesDb

  const dbPath = resolveDbPath()
  mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  initSchema(db)
  globalDb.__adaCodesDb = db
  return db
}

// ─── Génération de codes ─────────────────────────────────────────────────────
/**
 * Tire `count` caractères de l'alphabet sans biais modulo.
 * 31 * 8 = 248 : tout octet >= 248 est rejeté plutôt que replié.
 */
function randomChars(count: number): string {
  const out: string[] = []
  const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length // 248
  while (out.length < count) {
    const buf = randomBytes((count - out.length) * 2)
    for (const byte of buf) {
      if (byte >= limit) continue
      out.push(ALPHABET[byte % ALPHABET.length])
      if (out.length === count) break
    }
  }
  return out.join('')
}

export function generateCode(): string {
  const raw = randomChars(CODE_CHARS)
  const groups: string[] = []
  for (let i = 0; i < CODE_CHARS; i += GROUP_LEN) {
    groups.push(raw.slice(i, i + GROUP_LEN))
  }
  return groups.join('-')
}

/**
 * Normalise une saisie utilisateur : majuscules, suppression de tout ce qui
 * n'est pas dans l'alphabet, puis re-groupage en XXXX-XXXX-XXXX-XXXX.
 * Tolère les espaces, minuscules et tirets manquants d'un copier-coller.
 */
export function normalizeCode(input: string): string {
  const stripped = input.toUpperCase().replace(new RegExp(`[^${ALPHABET}]`, 'g'), '')
  if (stripped.length !== CODE_CHARS) return stripped
  const groups: string[] = []
  for (let i = 0; i < CODE_CHARS; i += GROUP_LEN) {
    groups.push(stripped.slice(i, i + GROUP_LEN))
  }
  return groups.join('-')
}

export function isValidCodeFormat(code: string): boolean {
  return CODE_REGEX.test(code)
}

// ─── Opérations sur le pool ──────────────────────────────────────────────────
export function countCodes(): { total: number; unused: number; issued: number } {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT
         COUNT(*)                                        AS total,
         SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) AS unused,
         SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) AS issued
       FROM codes`
    )
    .get()
  return {
    total: Number(row?.total ?? 0),
    unused: Number(row?.unused ?? 0),
    issued: Number(row?.issued ?? 0),
  }
}

/**
 * Insère `target` codes uniques en une seule transaction.
 * Les collisions aléatoires sont absorbées par INSERT OR IGNORE (PRIMARY KEY)
 * puis retentées, jusqu'à atteindre le quota.
 */
export function seedCodes(target: number = DEFAULT_SEED_TARGET): number {
  const db = getDb()
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO codes (code, status, issued_at, created_at)
     VALUES (?, 'unused', NULL, ?)`
  )

  let inserted = 0
  let rounds = 0
  const MAX_ROUNDS = 50 // garde-fou : en pratique 1 round suffit

  db.exec('BEGIN IMMEDIATE')
  try {
    while (inserted < target && rounds < MAX_ROUNDS) {
      const remaining = target - inserted
      for (let i = 0; i < remaining; i++) {
        inserted += Number(stmt.run(generateCode(), now).changes)
      }
      rounds++
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  return inserted
}

/**
 * Réserve atomiquement UN code 'unused' → 'issued' et le retourne.
 * BEGIN IMMEDIATE garantit qu'aucun autre écrivain ne peut réserver le
 * même code entre le SELECT et l'UPDATE.
 * @returns le code réservé, ou null si le pool est épuisé.
 */
export function issueCode(): string | null {
  const db = getDb()
  const now = new Date().toISOString()

  db.exec('BEGIN IMMEDIATE')
  try {
    const row = db.prepare(`SELECT code FROM codes WHERE status = 'unused' LIMIT 1`).get()
    if (!row) {
      db.exec('ROLLBACK')
      return null
    }
    const code = String(row.code)
    const res = db
      .prepare(`UPDATE codes SET status = 'issued', issued_at = ? WHERE code = ? AND status = 'unused'`)
      .run(now, code)
    if (Number(res.changes) !== 1) {
      db.exec('ROLLBACK')
      return null
    }
    db.exec('COMMIT')
    return code
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

/**
 * Consomme un code : il doit exister ET être au statut 'issued'.
 * Le DELETE conditionnel est atomique en une seule instruction : deux appels
 * concurrents sur le même code ne peuvent pas tous les deux renvoyer true.
 * @returns true si le code a bien été consommé (et supprimé).
 */
export function redeemCode(code: string): boolean {
  const db = getDb()
  const res = db.prepare(`DELETE FROM codes WHERE code = ? AND status = 'issued'`).run(code)
  return Number(res.changes) === 1
}

// ─── Jetons de téléchargement ────────────────────────────────────────────────
export function getTokenTtlSeconds(): number {
  const raw = Number(process.env.DOWNLOAD_TOKEN_TTL_SECONDS)
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 60
}

export function createDownloadToken(): { token: string; expiresIn: number } {
  const db = getDb()
  const ttl = getTokenTtlSeconds()
  const token = randomBytes(32).toString('base64url')
  const nowMs = Date.now()

  // Purge opportuniste : évite une table qui gonfle indéfiniment.
  db.prepare(`DELETE FROM download_tokens WHERE expires_at < ?`).run(nowMs - 3_600_000)

  db.prepare(
    `INSERT INTO download_tokens (token, created_at, expires_at, consumed_at)
     VALUES (?, ?, ?, NULL)`
  ).run(token, new Date(nowMs).toISOString(), nowMs + ttl * 1000)

  return { token, expiresIn: ttl }
}

/**
 * Consomme un jeton : valide, non expiré, non déjà consommé.
 * L'UPDATE conditionnel est atomique — le jeton ne peut jamais servir deux fois,
 * y compris si le stream échoue ensuite (choix délibéré : usage unique strict).
 */
export function consumeDownloadToken(token: string): boolean {
  const db = getDb()
  const res = db
    .prepare(
      `UPDATE download_tokens SET consumed_at = ?
       WHERE token = ? AND consumed_at IS NULL AND expires_at > ?`
    )
    .run(new Date().toISOString(), token, Date.now())
  return Number(res.changes) === 1
}
