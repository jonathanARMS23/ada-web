'use client'
import { useEffect, useRef } from 'react'

const STEPS = [
  { n: '01', title: 'Classification automatique',
    desc: 'ADA analyse votre prompt via un classifieur TF-IDF léger. Résultat : mode (solo / pipeline), tier recommandé (haiku / sonnet / opus), profil d\'agents. Tout en local, sans API externe.',
    code: [{ t: '$ ada classify "implémenter la recherche full-text"', ok: false }, { t: '→ mode=pipeline tier=2 profile=backend-nestjs', ok: true }] },
  { n: '02', title: 'Routing Thompson Sampling',
    desc: 'Pour chaque phase, ADA sample θ ~ Beta(α, β) pour chaque agent candidat. Celui avec le θ le plus élevé remporte la phase. Si mode=solo, un seul agent est activé — pas de fan-out injustifié.',
    code: [{ t: 'Phase db-schema → agent:db [haiku]  θ=0.87', ok: false }, { t: 'Phase backend   → agent:nestjs [opus]  θ=0.92', ok: false }] },
  { n: '03', title: 'Orchestration + micro-lessons',
    desc: 'Avant chaque spawn, ADA injecte les micro-lessons du ReasoningBank pour ce type de phase ainsi que les conventions projet depuis le bank de connaissances.',
    code: [{ t: '$ ada bank recall "recherche full-text"', ok: false }, { t: '→ 3 insights injectés en contexte', ok: true }] },
  { n: '04', title: 'Feedback loop — apprentissage continu',
    desc: 'Le hook Stop met à jour Beta(α, β), stocke la trajectoire dans SQLite, extrait les insights. La prochaine tâche similaire bénéficie de cet apprentissage. Chaque run améliore le suivant.' },
]

export function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const steps = stepsRef.current?.querySelectorAll('.step')
    if (!steps) return
    steps.forEach((s, i) => {
      const el = s as HTMLElement
      el.dataset.delay = String(i * 110)
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
    steps.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="how-bg" id="howworks">
      <div className="wrap">
        <div className="sec-label">✦ Workflow</div>
        <h2 className="sec-h2">De la commande au code livré.</h2>
        <p className="sec-sub">4 étapes automatiques. Vous décrivez la tâche, ADA orchestre le reste.</p>
        <div className="steps" ref={stepsRef}>
          {STEPS.map((s, i) => (
            <div key={i} className="step">
              <div className="step-n">{s.n}</div>
              <div>
                <h4 className="step-h">{s.title}</h4>
                <p className="step-p">{s.desc}</p>
                {s.code && (
                  <div className="step-code">
                    {s.code.map((l, j) => (
                      <span key={j} className={l.ok ? 'ok' : ''} style={{ display: 'block' }}>{l.t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
