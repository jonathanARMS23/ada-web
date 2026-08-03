/**
 * POST /api/internal/codes/seed — génère le pool de codes (usage unique).
 *
 * Auth : header `x-internal-key` = INTERNAL_API_KEY (comparaison à temps constant).
 *
 * Idempotence : si la table contient déjà des codes, l'appel est REFUSÉ (409).
 * Il n'y a jamais de double-seed silencieux.
 *
 * ⚠️ `force: true` — À MANIER AVEC PRÉCAUTION
 *   Ajoute `count` codes SUPPLÉMENTAIRES au pool existant (top-up).
 *   Volontairement NON destructif : on ne supprime jamais les codes existants,
 *   car un code déjà au statut 'issued' a pu être transmis à un client payant —
 *   le supprimer révoquerait son téléchargement sans recours.
 *   Risque résiduel : appels répétés = pool qui gonfle (aucune perte de données).
 */
import { isAuthorizedInternalRequest, unauthorizedResponse } from '@/lib/internal-auth'
import { countCodes, seedCodes, DEFAULT_SEED_TARGET } from '@/lib/codes-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_COUNT = 1_000_000

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedInternalRequest(request)) return unauthorizedResponse()

  let force = false
  let count = DEFAULT_SEED_TARGET

  // Body optionnel : un POST sans corps utilise les valeurs par défaut.
  try {
    const raw: unknown = await request.json()
    if (raw && typeof raw === 'object') {
      const body = raw as { force?: unknown; count?: unknown }
      force = body.force === true
      if (body.count !== undefined) {
        const parsed = Number(body.count)
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_COUNT) {
          return Response.json(
            { error: `count must be an integer between 1 and ${MAX_COUNT}` },
            { status: 400 }
          )
        }
        count = parsed
      }
    }
  } catch {
    // Pas de body / JSON invalide → défauts.
  }

  const before = countCodes()

  if (before.total > 0 && !force) {
    return Response.json(
      {
        error: 'pool already seeded',
        detail:
          'The codes table is not empty. Refusing to seed again. ' +
          'Pass {"force": true} to ADD codes on top of the existing pool (non-destructive).',
        existing: before.total,
      },
      { status: 409 }
    )
  }

  const inserted = seedCodes(count)
  const after = countCodes()

  // On ne renvoie JAMAIS les codes en clair — uniquement des compteurs.
  return Response.json({
    inserted,
    requested: count,
    forced: force,
    pool: { total: after.total, unused: after.unused, issued: after.issued },
  })
}
