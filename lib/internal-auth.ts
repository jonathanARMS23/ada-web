/**
 * Authentification des endpoints internes par clé partagée.
 *
 * Fail-closed : si INTERNAL_API_KEY est absente ou vide, TOUTE requête est
 * refusée. Une clé non configurée ne doit jamais ouvrir l'accès.
 */
import { createHash, timingSafeEqual } from 'node:crypto'

const INTERNAL_KEY_HEADER = 'x-internal-key'

/**
 * Comparaison à temps constant. Les deux valeurs sont hachées en SHA-256 au
 * préalable : timingSafeEqual exige des buffers de longueur identique, et le
 * hachage évite en plus de divulguer la longueur de la clé attendue.
 */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a, 'utf8').digest()
  const hb = createHash('sha256').update(b, 'utf8').digest()
  return timingSafeEqual(ha, hb)
}

export function isAuthorizedInternalRequest(request: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY
  if (!expected || expected.trim() === '') return false // fail-closed

  const provided = request.headers.get(INTERNAL_KEY_HEADER)
  if (!provided) return false

  return safeEqual(provided, expected)
}

/** Réponse 401 uniforme, sans aucun détail exploitable. */
export function unauthorizedResponse(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}
