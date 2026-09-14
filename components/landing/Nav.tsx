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
        <span className="v-badge">AI ENGINEERING OS</span>
      </Link>
      <ul className="nav-links">
        <li><Link href="#platform" className="nav-link-item">Plateforme</Link></li>
        <li><Link href="#architecture" className="nav-link-item">Architecture</Link></li>
        <li><Link href="#engines" className="nav-link-item">Moteurs</Link></li>
        <li><Link href="/docs" className="nav-link-item">Documentation</Link></li>
        <li><a href="https://byarms.com" className="nav-cta" target="_blank" rel="noreferrer">Parler à ByARMS ↗</a></li>
      </ul>
      <button className="nav-hamburger" aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}
