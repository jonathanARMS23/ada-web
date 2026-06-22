import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ADA — Orchestrate. Learn. Ship.',
  description: 'Le coordinateur adaptatif pour Claude Code. Mémoire persistante. Routing intelligent. Production-ready.',
  keywords: ['ADA', 'AI Dev Assistant', 'Claude Code', 'orchestrator', 'Thompson Sampling', 'agents'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
