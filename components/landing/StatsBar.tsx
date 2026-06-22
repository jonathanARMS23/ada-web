'use client'
import { useEffect, useRef, useState } from 'react'

const STATS = [
  { to: 29, suf: '', label: 'suites de tests' },
  { to: 650, suf: '', label: 'assertions' },
  { to: 107, suf: '/120', label: 'benchmark score' },
  { static: 'v7.2', label: 'version stable' },
]

function StatNum({ to, suf }: { to: number; suf: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      let cur = 0; const inc = to / 55
      const t = setInterval(() => {
        cur = Math.min(cur + inc, to); setVal(Math.floor(cur))
        if (cur >= to) clearInterval(t)
      }, 16)
    }, { threshold: 0.6 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <div className="stat-n" ref={ref}>{val}{suf}</div>
}

export function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {STATS.map((s, i) => (
          <div key={i}>
            {'static' in s
              ? <div className="stat-n">{s.static}</div>
              : <StatNum to={s.to!} suf={s.suf!} />
            }
            <div className="stat-l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
