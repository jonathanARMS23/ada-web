import Link from 'next/link'

export function CTASection() {
  return (
    <section className="cta-sec" id="start">
      <div className="cta-glow" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="sec-label" style={{ justifyContent: 'center' }}>✦ Prêt ?</div>
        <h2 className="cta-h2">
          <span className="grad">Orchestrez vos agents.<br />Maintenant.</span>
        </h2>
        <p className="cta-sub">Une commande pour démarrer. Zéro config. Mémoire active dès le premier run.</p>
        <div className="cta-cmd">$ ada run "ma première feature"</div>
        <br />
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          <Link href="/docs" className="btn-p">Voir la documentation →</Link>
          <Link href="#features" className="btn-g">Revoir les features</Link>
        </div>
      </div>
    </section>
  )
}
