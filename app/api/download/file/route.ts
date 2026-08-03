/**
 * GET /api/download/file?token=... — sert l'archive ADA en stream.
 *
 * Le fichier vit HORS de `public/` (donc non servi statiquement) : cette route
 * est le SEUL chemin d'accès à l'archive, et elle exige un jeton valide.
 *
 * Le jeton est consommé (invalidé) AVANT le stream : un jeton ne sert jamais
 * deux fois, même si le transfert échoue ensuite. Choix délibéré d'usage unique
 * strict, conforme à la spec.
 */
import { consumeDownloadToken } from '@/lib/codes-db'
import { openDownloadAsset } from '@/lib/download-asset'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Réponse d'échec uniforme : ne distingue pas jeton inconnu / expiré / déjà utilisé. */
function gone(): Response {
  return Response.json(
    { error: 'Lien de téléchargement invalide ou expiré.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return gone()

  // Consommation atomique : invalide le jeton immédiatement.
  if (!consumeDownloadToken(token)) return gone()

  const asset = await openDownloadAsset()
  if (!asset) return gone()

  return new Response(asset.stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${asset.filename}"`,
      'Content-Length': String(asset.size),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
