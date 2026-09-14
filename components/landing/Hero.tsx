'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Terminal } from './Terminal'

export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="hero-grid" /></div>
      <div className="hero-shell">
        <div className="hero-copy">
          <div className="pill"><span className="pill-dot" /> AI Engineering OS · Claude Code + Codex</div>
          <h1 className="hero-h1">L’ingénierie augmentée.<br /><span className="grad">Enfin opérable.</span></h1>
          <p className="hero-sub">ADA transforme des moteurs agentiques puissants en un système d’ingénierie maîtrisé : orchestration, mémoire projet, permissions, traçabilité et qualité — dans une même couche d’exécution.</p>
          <div className="hero-ctas"><a href="https://byarms.com" className="btn-p" target="_blank" rel="noreferrer">Construire avec ByARMS <span>↗</span></a><Link href="/docs" className="btn-g">Explorer l’architecture</Link></div>
          <div className="hero-proof"><span>Abonnements locaux</span><i /><span>Contrats moteur-agnostiques</span><i /><span>Writer unique</span></div>
        </div>
        <div className="hero-product">
          <div className="product-kicker"><span>ADA CONTROL PLANE</span><span className="live-label">OPERATIONAL</span></div>
          <Terminal />
          <div className="engine-rail"><div><span className="engine-icon">C</span><b>Claude Code</b><small>subscription · ready</small></div><span className="rail-line" /><div><span className="engine-icon codex">X</span><b>Codex</b><small>app-server · ready</small></div></div>
        </div>
      </div>
      <a href="https://byarms.com" className="hero-byarms" target="_blank" rel="noreferrer"><span className="hero-byarms-label">Engineered by</span><Image src="/byarms-logo.png" alt="ByARMS" width={34} height={34} /><span className="hero-byarms-name">ByARMS</span></a>
    </section>
  )
}
