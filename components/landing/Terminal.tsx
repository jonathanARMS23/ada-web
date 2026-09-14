'use client'
import { useEffect, useState } from 'react'

const LINES = [
  { text: 'ada run "secure the billing workflow"', kind: 'cmd' },
  { text: 'workspace  byarms/platform · lease acquired', kind: 'muted' },
  { text: 'context    6 project conventions recalled', kind: 'muted' },
  { text: 'plan       architecture → implementation → verification', kind: 'info' },
  { text: 'claude     architecture & implementation', kind: 'claude' },
  { text: 'codex      independent verification', kind: 'codex' },
  { text: 'result     checks passed · evidence recorded', kind: 'ok' },
]

export function Terminal() {
  const [visible, setVisible] = useState(1)
  useEffect(() => { const timer = window.setInterval(() => setVisible(v => v >= LINES.length ? 1 : v + 1), 680); return () => window.clearInterval(timer) }, [])
  return <div className="terminal" aria-label="Exemple d’exécution ADA"><div className="t-bar"><div className="t-dots"><i /><i /><i /></div><span>run_9f2a · live</span><span className="t-secure">● protected</span></div><div className="t-body">{LINES.map((line, i) => <div key={line.text} className={`terminal-row ${line.kind}${i < visible ? ' on' : ''}`}><span className="row-index">{String(i + 1).padStart(2, '0')}</span><span>{i === 0 ? '$ ' : '› '}{line.text}</span></div>)}</div></div>
}
