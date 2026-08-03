/**
 * Accès à l'archive privée servie après validation d'un code.
 *
 * Isolé dans lib/ (et non dans la route) volontairement : quand la résolution
 * de chemin dynamique et les appels `fs` cohabitent dans le module de route,
 * le file-tracing (NFT) de Turbopack abandonne et embarque tout le projet dans
 * le bundle `output: 'standalone'` (warning « whole project was traced »).
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import path from 'node:path'

/** Chemin de l'archive. Surchargeable via DOWNLOAD_FILE_PATH (volume, autre release…). */
export function resolveDownloadFilePath(): string {
  const configured = process.env.DOWNLOAD_FILE_PATH?.trim()
  if (configured) return path.resolve(configured)
  // Relatif au cwd du serveur (/app en conteneur).
  return path.resolve('private-assets', 'ADA-v7.zip')
}

export interface DownloadAsset {
  stream: ReadableStream<Uint8Array>
  size: number
  filename: string
}

/**
 * Ouvre l'archive en flux.
 * @returns null si le fichier est absent ou illisible (l'appelant reste générique).
 */
export async function openDownloadAsset(): Promise<DownloadAsset | null> {
  const filePath = resolveDownloadFilePath()

  try {
    const info = await stat(filePath)
    if (!info.isFile()) return null

    const nodeStream = createReadStream(filePath)
    return {
      stream: Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>,
      size: info.size,
      filename: path.basename(filePath),
    }
  } catch {
    console.error(`[download] archive introuvable ou illisible : ${filePath}`)
    return null
  }
}
