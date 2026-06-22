'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SearchModal } from './SearchModal'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ada-theme')
    if (saved === 'light') {
      setIsLight(true)
      document.documentElement.classList.add('light')
    }
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const toggleTheme = () => {
    const next = !isLight
    setIsLight(next)
    document.documentElement.classList.toggle('light', next)
    localStorage.setItem('ada-theme', next ? 'light' : 'dark')
  }

  return (
    <>
      <nav id="topbar">
        <div className="hamburger" onClick={onMenuClick} aria-label="Toggle navigation">
          <span /><span /><span />
        </div>
        <div className="topbar-logo">
          <div className="logo-circle">
            <Image src="/ada-logo.png" alt="ADA" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
          </div>
          <span className="logo-text">ADA</span>
        </div>
        <div className="version-badge">
          <div className="version-dot" />
          v7.2.0
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search docs
            <kbd className="kbd">⌘K</kbd>
          </button>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {isLight ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            )}
          </button>
          <a href="https://github.com/ada-agent/ada" className="icon-btn" title="GitHub" target="_blank" rel="noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>
      </nav>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
