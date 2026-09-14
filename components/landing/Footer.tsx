import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="ada-footer">
      <div className="foot-inner">
        <div className="foot-brand">
          <div style={{ width: 44, height: 44, position: 'relative', overflow: 'hidden', borderRadius: 10, flexShrink: 0 }}>
            <Image src="/ada-logo.png" alt="ADA" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-s)' }}>ADA · AI Engineering OS</span>
            <span style={{ color: 'var(--text-m)', marginLeft: 6 }}>— Engineered by ByARMS</span>
          </div>
        </div>
        <div className="foot-links">
          <Link href="/docs">Documentation</Link>
          <Link href="/docs/engines">Claude + Codex</Link>
          <Link href="/docs/status">État produit</Link>
          <a href="https://byarms.com" target="_blank" rel="noreferrer">ByARMS ↗</a>
        </div>
      </div>

      <div className="foot-bottom">
        <span className="foot-copy">© {year} ARMS. All rights reserved.</span>
        <a href="https://byarms.com" className="byarms-badge" target="_blank" rel="noreferrer">
          <span className="byarms-label">Powered by</span>
          <div style={{ width: 36, height: 36, position: 'relative', overflow: 'hidden', borderRadius: 6, flexShrink: 0 }}>
            <Image src="/byarms-logo.png" alt="ByARMS" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <span className="byarms-name">ByARMS</span>
        </a>
      </div>
    </footer>
  )
}
