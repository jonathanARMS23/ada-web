'use client'
import { useEffect, useRef } from 'react'

const CARDS = [
  { span2: true, icon: '🧠', title: 'Thompson Sampling adaptatif',
    desc: 'Chaque couple (phase, agent) maintient une distribution Beta(α, β). α = succès cumulés, β = échecs. L\'agent avec le θ le plus élevé est sélectionné — la distribution se met à jour après chaque run, affinant le routing en continu.',
    code: 'θ ~ Beta(α+1, β+1) → argmax(θ) → reward feedback' },
  { icon: '⚡', title: 'Zéro dépendance runtime',
    desc: 'Node.js 22+ uniquement. node:sqlite, node:crypto, node:http — tout natif. Aucun npm install en production.' },
  { icon: '🔐', title: 'Sécurité by design',
    desc: 'HMAC-SHA256 sur tous les plugins. JWT one-time tickets. CSP nonce dynamique. Rate limiting intégré. Ed25519 federation (ADR-013).' },
  { icon: '📊', title: 'ReasoningBank SQLite',
    desc: 'Trajectoires, insights, méta — tout persiste dans node:sqlite natif. TF-IDF embeddings + RRF+MMR retrieval pour le recall (ADR-012).' },
  { icon: '🔀', title: 'DAG Pipelines',
    desc: 'Phases parallélisables via graphe acyclique dirigé. Topologie parallel_mesh, séquentielle ou hybride — selon la complexité détectée (ADR-002).' },
  { icon: '🔌', title: 'Plugin SDK',
    desc: 'Plugins signés HMAC, hot-reload, isolés. Étendez ADA sans toucher au core. Versionnés et audités à chaque chargement (ADR-005, ADR-011).' },
  { icon: '📡', title: 'Dashboard HTTP temps réel',
    desc: 'Dashboard embarqué sur :7821. Métriques, runs actifs, graphes Thompson — accessible sans dépendance externe (ADR-007).' },
  { icon: '🔁', title: 'Streaming EventEmitter',
    desc: 'Backpressure natif via node:events. Sortie des agents streamée au fur et à mesure — pas d\'accumulation mémoire en attente de fin de run (ADR-010).' },
  { icon: '🗺', title: 'Knowledge Graph',
    desc: 'Graphe de connaissances projet via Graphify (ADR-014). Entités, relations, clusters — le contexte traverse les sessions et s\'enrichit automatiquement.' },
]

export function Features() {
  const bentoRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cards = bentoRef.current?.querySelectorAll('.card')
    if (!cards) return
    // Progressive enhancement: mark for animation only after mount
    cards.forEach((c, i) => {
      const el = c as HTMLElement
      el.dataset.delay = String((i % 3) * 90)
      el.classList.add('will-animate')
    })
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = parseInt((e.target as HTMLElement).dataset.delay || '0')
          setTimeout(() => (e.target as HTMLElement).classList.add('in'), d)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    cards.forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="sec" id="features">
      <div className="wrap">
        <div className="sec-label">✦ Philosophie produit</div>
        <h2 className="sec-h2">Conçu pour la production.</h2>
        <p className="sec-sub">Pas un wrapper. Un coordinateur autonome avec mémoire, apprentissage et sécurité intégrés.</p>
        <div className="bento" ref={bentoRef}>
          {CARDS.map((c, i) => (
            <div key={i} className={`card${c.span2 ? ' span2' : ''}`}>
              <span className="card-icon">{c.icon}</span>
              <h3 className="card-h3">{c.title}</h3>
              <p className="card-p">{c.desc}</p>
              {c.code && <div className="code-inline">{c.code}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
