import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // /api/download/file résout son chemin au runtime (DOWNLOAD_FILE_PATH), ce que
  // le file-tracing (NFT) ne peut pas analyser statiquement : il embarque alors
  // tout le projet dans le bundle standalone. On exclut explicitement ce qui n'a
  // rien à y faire — notamment l'archive de 6,4 Mo, fournie par un COPY du
  // Dockerfile (donc ne PAS retirer ce COPY).
  outputFileTracingExcludes: {
    '/api/download/file': ['private-assets/**/*', 'scripts/**/*', '.github/**/*'],
  },
}

export default nextConfig
