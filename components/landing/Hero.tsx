'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Terminal } from './Terminal'

export function Hero() {
  const o1 = useRef<HTMLDivElement>(null)
  const o2 = useRef<HTMLDivElement>(null)
  const o3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0, raf = false
    const applyParallax = () => {
      const y = window.scrollY
      if (o1.current) o1.current.style.transform = `translate(${mx*28}px,${y*.14+my*18}px)`
      if (o2.current) o2.current.style.transform = `translate(${mx*-20}px,${y*-.09+my*14}px)`
      if (o3.current) o3.current.style.transform = `translate(${mx*12}px,${y*.07+my*-10}px)`
      raf = false
    }
    const sched = () => { if (!raf) { raf = true; requestAnimationFrame(applyParallax) } }
    const onMouse = (e: MouseEvent) => { mx = e.clientX/innerWidth-.5; my = e.clientY/innerHeight-.5; sched() }
    window.addEventListener('scroll', sched, { passive: true })
    document.addEventListener('mousemove', onMouse)
    return () => { window.removeEventListener('scroll', sched); document.removeEventListener('mousemove', onMouse) }
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="orb orb-1" ref={o1} />
        <div className="orb orb-2" ref={o2} />
        <div className="orb orb-3" ref={o3} />
        <div className="hero-grid" />
      </div>
      <div className="hero-content">
        <div className="pill">
          <span>✦</span>
          <span>Orchestrateur natif Claude Code · Thompson Sampling · Zéro dépendance</span>
        </div>
        <h1 className="hero-h1">
          <span className="grad">Orchestrate.</span><br />
          <span className="grad">Learn. Ship.</span>
        </h1>
        <p className="hero-sub">
          Le coordinateur adaptatif pour <strong>Claude Code</strong>.<br />
          Mémoire persistante. Routing intelligent. Production-ready.
        </p>
        <div className="hero-ctas">
          <Link href="#start" className="btn-p">Démarrer maintenant →</Link>
          <Link href="/docs" className="btn-g">Documentation complète</Link>
        </div>
        <Terminal />
        <a href="https://byarms.com" className="hero-byarms" target="_blank" rel="noreferrer">
          <span className="hero-byarms-label">Built by</span>
          <div style={{ width: 44, height: 44, position: 'relative', overflow: 'hidden', borderRadius: 8, flexShrink: 0 }}>
            <Image src="/byarms-logo.png" alt="ByARMS" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <span className="hero-byarms-name">ByARMS</span>
        </a>
      </div>
    </section>
  )
}
