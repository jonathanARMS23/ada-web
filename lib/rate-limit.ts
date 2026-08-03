/**
 * Rate-limit basique en mémoire (fenêtre glissante), par IP.
 *
 * Défense en profondeur uniquement : l'entropie des codes (31^16) rend déjà
 * l'énumération infaisable. Volontairement en mémoire — un rate-limit
 * best-effort ne justifie pas des écritures SQLite sur chaque tentative.
 */
type Bucket = number[] // timestamps (ms) des tentatives retenues

type RateLimitGlobal = typeof globalThis & { __adaRateLimit?: Map<string, Bucket> }
const globalRl = globalThis as RateLimitGlobal

function store(): Map<string, Bucket> {
  if (!globalRl.__adaRateLimit) globalRl.__adaRateLimit = new Map()
  return globalRl.__adaRateLimit
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter: number // secondes
}

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000): RateLimitResult {
  const buckets = store()
  const now = Date.now()
  const cutoff = now - windowMs

  const recent = (buckets.get(key) ?? []).filter(ts => ts > cutoff)

  if (recent.length >= limit) {
    const oldest = recent[0]
    buckets.set(key, recent)
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) }
  }

  recent.push(now)
  buckets.set(key, recent)

  // Purge périodique des buckets inactifs pour borner la mémoire.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every(ts => ts <= cutoff)) buckets.delete(k)
    }
  }

  return { allowed: true, retryAfter: 0 }
}

/**
 * IP client. Derrière le proxy Coolify/Traefik, x-forwarded-for est renseigné ;
 * on prend la première entrée (le client d'origine).
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
