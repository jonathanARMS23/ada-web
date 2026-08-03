/**
 * POST /api/internal/codes/issue — réserve UN code du pool.
 *
 * Auth : header `x-internal-key` = INTERNAL_API_KEY (comparaison à temps constant).
 *
 * Fait passer un code de 'unused' à 'issued' de façon atomique et le retourne.
 * Le code n'est PAS supprimé ici : il ne le sera qu'à la redemption par le client.
 * Seuls les codes 'issued' sont consommables côté public.
 */
import { isAuthorizedInternalRequest, unauthorizedResponse } from '@/lib/internal-auth'
import { countCodes, issueCode } from '@/lib/codes-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedInternalRequest(request)) return unauthorizedResponse()

  const code = issueCode()

  if (!code) {
    return Response.json(
      {
        error: 'pool exhausted',
        detail: 'No code with status="unused" remains. Seed additional codes before issuing.',
      },
      { status: 503 }
    )
  }

  const pool = countCodes()

  return Response.json(
    { code, remaining: pool.unused },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
