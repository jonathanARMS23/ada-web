'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`ada-nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <Link href="/" className="nav-logo">
        <div className="logo-mark">
          <Image src="/ada-logo.png" alt="ADA" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        </div>
        <span className="logo-name">ADA</span>
        <span className="v-badge">
          <span className="v-badge-dot" />
          v7.2.0
        </span>
      </Link>
      <ul className="nav-links">
        <li><Link href="#features" className="nav-link-item">Features</Link></li>
        <li><Link href="#howworks" className="nav-link-item">Workflow</Link></li>
        <li><Link href="#routing" className="nav-link-item">Routing</Link></li>
        <li><Link href="#tiers" className="nav-link-item">Tiers</Link></li>
        <li><Link href="/docs" className="nav-link-item">Documentation</Link></li>
        <li><Link href="#start" className="nav-cta">Démarrer →</Link></li>
      </ul>
      <button className="nav-hamburger" aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}
