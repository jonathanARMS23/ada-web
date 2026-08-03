/**
 * POST /api/download/redeem — endpoint PUBLIC de consommation d'un code.
 *
 * Body : { code: string }
 *
 * Un code est acceptable uniquement s'il existe ET est au statut 'issued'.
 * En cas de succès il est SUPPRIMÉ définitivement, puis un jeton de
 * téléchargement à usage unique et courte durée de vie est émis.
 *
 * Sécurité — anti-énumération :
 *  - message d'erreur STRICTEMENT identique dans tous les cas d'échec
 *    (code inconnu / encore 'unused' / déjà consommé), afin de ne rien
 *    divulguer sur l'état du pool ;
 *  - rate-limit par IP (10 tentatives / minute) en défense en profondeur.
 */
import { createDownloadToken, isValidCodeFormat, normalizeCode, redeemCode } from '@/lib/codes-db'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

/** Message unique pour tout échec de validation — ne jamais le différencier. */
const GENERIC_ERROR = 'Code invalide ou déjà utilisé.'

function invalid(): Response {
  return Response.json(
    { ok: false, error: GENERIC_ERROR },
    { status: 400, headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request): Promise<Response> {
  const rate = checkRateLimit(`redeem:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return Response.json(
      { ok: false, error: 'Trop de tentatives. Merci de réessayer dans un instant.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfter), 'Cache-Control': 'no-store' },
      }
    )
  }

  let rawCode: unknown
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object') return invalid()
    rawCode = (body as { code?: unknown }).code
  } catch {
    return invalid()
  }

  if (typeof rawCode !== 'string') return invalid()
  // Borne la taille avant tout traitement (évite un travail inutile sur une entrée absurde).
  if (rawCode.length > 64) return invalid()

  const code = normalizeCode(rawCode)
  if (!isValidCodeFormat(code)) return invalid()

  // Atomique : seul un code 'issued' est supprimé, et une seule fois.
  if (!redeemCode(code)) return invalid()

  const { token, expiresIn } = createDownloadToken()

  return Response.json(
    { ok: true, downloadToken: token, expiresIn },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
