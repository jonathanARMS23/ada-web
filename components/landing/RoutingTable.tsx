'use client'
import { useState } from 'react'

const ROWS = [
  { kw: ['nestjs', 'next'], profile: 'fullstack', a: [{l:'nestjs',c:'ct3'},{l:'nextjs',c:'ct2'},{l:'db',c:'ct1'}] },
  { kw: ['drf', 'django', 'python'], profile: 'backend-drf', a: [{l:'drf',c:'ct3'},{l:'db',c:'ct1'},{l:'tester',c:'ct1'}] },
  { kw: ['frontend', 'react', 'ui'], profile: 'frontend', a: [{l:'nextjs',c:'ct2'},{l:'ux-designer',c:'ct2'},{l:'reviewer',c:'ct2'}] },
  { kw: ['nestjs seul'], profile: 'backend-nestjs', a: [{l:'nestjs',c:'ct3'},{l:'db',c:'ct1'},{l:'tester',c:'ct1'}] },
  { kw: ['docker', 'deploy', 'ci'], profile: 'devops', a: [{l:'devops',c:'ct2'},{l:'security-auditor',c:'ct2'},{l:'reviewer',c:'ct2'}] },
  { kw: ['review', 'audit', 'perf'], profile: 'review', a: [{l:'reviewer',c:'ct3'},{l:'security-auditor',c:'ct2'},{l:'performance-analyst',c:'ct2'}] },
  { kw: ['llm', 'agent', 'multi-agent'], profile: 'ai-engineer', a: [{l:'ai-engineer',c:'ct3'},{l:'agent-architect',c:'ct3'},{l:'memory-engineer',c:'ct2'}] },
  { kw: ['architecture', 'conception'], profile: 'strategy', a: [{l:'feature-architect',c:'ct3'},{l:'devils-advocate',c:'ct2'},{l:'api-designer',c:'ct2'}] },
  { kw: ['react native', 'expo'], profile: 'mobile-rn', a: [{l:'react-native',c:'ct2'},{l:'api-designer',c:'ct2'},{l:'reviewer',c:'ct2'}] },
  { kw: ['saas', 'bootstrap', 'startup'], profile: 'saas-builder', a: [{l:'technical-architect',c:'ct3'},{l:'db',c:'ct1'},{l:'devops',c:'ct2'}] },
]

export function RoutingTable() {
  const [q, setQ] = useState('')
  const rows = q ? ROWS.filter(r =>
    r.kw.some(k => k.includes(q.toLowerCase())) ||
    r.profile.includes(q.toLowerCase()) ||
    r.a.some(a => a.l.includes(q.toLowerCase()))
  ) : ROWS

  return (
    <section className="sec" id="routing" style={{ background: 'var(--bg)' }}>
      <div className="wrap">
        <div className="sec-label">✦ Intelligence de routing</div>
        <h2 className="sec-h2">Le bon agent pour chaque tâche.</h2>
        <p className="sec-sub">ADA détecte le profil depuis les mots-clés du prompt. Solo par défaut — fan-out uniquement sur détection pipeline.</p>
        <div className="route-wrap">
          <div className="inline-search">
            <svg width="14" height="14" fill="none" stroke="var(--text-m)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Filtrer par keyword, profil ou agent..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <table className="rt">
            <thead><tr><th>Prompt contient</th><th>Profil</th><th>Agents activés</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><div className="chips">{r.kw.map(k => <span key={k} className="ck">{k}</span>)}</div></td>
                  <td><span className="cp">{r.profile}</span></td>
                  <td><div className="chips">{r.a.map(a => <span key={a.l} className={a.c}>{a.l}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="callout-amber">
            ⚠&nbsp; Fan-out multi-agents → uniquement si <code>classify</code> retourne <code>mode=pipeline</code>. Sinon 1 agent solo. Le fan-out injustifié coûte <strong>~2,5× tokens</strong> sans gain de qualité mesuré.
          </div>
        </div>
      </div>
    </section>
  )
}
