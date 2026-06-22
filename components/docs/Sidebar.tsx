'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { NAV_ITEMS } from '@/lib/docs-nav'

const GROUP_ICONS: Record<string, React.ReactElement> = {
  'Navigation': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  'Quick Start': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  'Concepts': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
  'CLI Reference': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  'Agents & Routing': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>
  ),
  'Security': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  'Architecture': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  'ADRs': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  'ADA API': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="8" rx="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  'ADA UI': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  'Deployment': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 14 19.79 19.79 0 0 1 1.08 5.38 2 2 0 0 1 3.06 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18"/>
    </svg>
  ),
  'Releases': (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const pillRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  const activeSlug =
    pathname === '/docs' || pathname === '/docs/'
      ? ''
      : pathname.replace('/docs/', '')

  const groups: Record<string, typeof NAV_ITEMS> = {}
  for (const item of NAV_ITEMS) {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  }

  useEffect(() => {
    function movePill() {
      const pill = pillRef.current
      const nav = navRef.current
      if (!pill || !nav) return
      const active = nav.querySelector('.nav-link.active') as HTMLElement | null
      if (!active) { pill.style.opacity = '0'; return }
      const sidebarEl = nav.closest('#sidebar') as HTMLElement | null
      const scrollTop = sidebarEl ? sidebarEl.scrollTop : 0
      const navRect = nav.getBoundingClientRect()
      const linkRect = active.getBoundingClientRect()
      pill.style.top = (linkRect.top - navRect.top + scrollTop + 6) + 'px'
      pill.style.height = (linkRect.height - 12) + 'px'
      pill.style.opacity = '1'
    }

    movePill()
    const sidebarEl = navRef.current?.closest('#sidebar') as HTMLElement | null
    sidebarEl?.addEventListener('scroll', movePill, { passive: true })
    return () => sidebarEl?.removeEventListener('scroll', movePill)
  }, [pathname])

  const year = new Date().getFullYear()

  return (
    <nav className="sidebar-nav" ref={navRef}>
      <div className="nav-pill" ref={pillRef} />
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="sidebar-group">
          <div className="sidebar-group-label">
            {GROUP_ICONS[group]}
            {group}
          </div>
          {items.map(item => {
            const isActive = item.slug === activeSlug
            const href = item.slug ? `/docs/${item.slug}` : '/docs'
            return (
              <Link
                key={item.slug}
                href={href}
                onClick={onClose}
                className={`nav-link${isActive ? ' active' : ''}`}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      ))}

      <div className="sidebar-footer">
        <a href="https://byarms.com" className="sidebar-byarms" target="_blank" rel="noreferrer">
          <span className="sidebar-byarms-label">Powered by</span>
          <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden', borderRadius: 4, flexShrink: 0 }}>
            <Image src="/byarms-logo.png" alt="ByARMS" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <span className="sidebar-byarms-name">ByARMS</span>
        </a>
        <div className="sidebar-copy">© {year} ARMS</div>
      </div>
    </nav>
  )
}
