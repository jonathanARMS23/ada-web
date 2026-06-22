'use client'
import { useEffect, useRef } from 'react'

const LINES = [
  { text: '$ ada run "implement user invitation feature"', cls: 't-prompt' },
  { text: '✓ Classifying...  mode=pipeline  tier=2', cls: 't-ok' },
  { text: '✓ Injecting 3 ReasoningBank insights', cls: 't-ok' },
  { text: '✓ Phase 1/4: db-schema    → agent:db     [haiku]', cls: 't-h' },
  { text: '✓ Phase 2/4: tdd-specs    → agent:tester [haiku]', cls: 't-h' },
  { text: '⠸ Phase 3/4: backend-impl → agent:nestjs [opus]', cls: 't-o' },
  { text: '⠸ Phase 4/4: frontend     → agent:nextjs [sonnet]', cls: 't-s' },
]

export function Terminal() {
  const tbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const run = () => {
      const tb = tbRef.current
      if (!tb) return
      tb.innerHTML = ''
      LINES.forEach((l, i) => {
        const el = document.createElement('span')
        el.className = `tl ${l.cls}`
        el.textContent = l.text
        tb.appendChild(el)
        setTimeout(() => el.classList.add('on'), i * 480 + 200)
      })
      setTimeout(() => {
        const cur = document.createElement('span')
        cur.className = 't-cursor'
        tb.appendChild(cur)
      }, LINES.length * 480 + 600)
    }
    run()
    const interval = setInterval(run, 9500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="terminal">
      <div className="t-bar">
        <div className="t-dot t-dot-r" />
        <div className="t-dot t-dot-y" />
        <div className="t-dot t-dot-g" />
        <span className="t-bar-label">ada — zsh</span>
      </div>
      <div className="t-body" ref={tbRef} />
    </div>
  )
}
