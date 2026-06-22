'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/docs-nav'

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const results = query.length > 1
    ? NAV_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.group.toLowerCase().includes(query.toLowerCase()) ||
        item.slug.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : NAV_ITEMS.slice(0, 8)

  useEffect(() => {
    if (open) {
      setQuery('')
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[idx]) {
        const item = results[idx]
        router.push(item.slug ? `/docs/${item.slug}` : '/docs')
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, idx, results, router, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] mx-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--text-m)] flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setIdx(0) }}
            placeholder="Rechercher dans la documentation..."
            className="flex-1 bg-transparent border-0 outline-none text-[var(--text)] text-[15px] placeholder-[var(--text-m)] font-sans"
          />
          <kbd className="font-mono text-[11px] text-[var(--text-m)] bg-[var(--surface-el)] px-2 py-0.5 rounded border border-[var(--border)]">Esc</kbd>
        </div>

        <div className="py-2">
          {results.map((item, i) => (
            <button
              key={item.slug}
              onClick={() => {
                router.push(item.slug ? `/docs/${item.slug}` : '/docs')
                onClose()
              }}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                i === idx ? 'bg-[rgba(124,58,237,.12)]' : 'hover:bg-[rgba(124,58,237,.06)]'
              }`}
            >
              <span className="text-[10px] font-mono text-[var(--text-m)] min-w-[90px]">{item.group}</span>
              <span className={`text-[14px] ${i === idx ? 'text-[var(--text)]' : 'text-[var(--text-s)]'}`}>
                {item.title}
              </span>
              {i === idx && (
                <span className="ml-auto text-[var(--primary)]">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-m)] font-mono">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>Esc fermer</span>
        </div>
      </div>
    </div>
  )
}
