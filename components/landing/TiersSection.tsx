'use client'
import React, { useState } from 'react'

const TIERS = [
  { id: 't1', n: '1', model: 'claude-haiku-4-5', usage: 'Vérification, coverage, tâches simples', cost: '🟢 Faible', nc: 'ct1', mc: '#10B981',
    detail: 'Utilisé pour les phases courtes et répétitives : écriture de tests, validation de schéma, couverture de code. Le sampling Beta favorise Haiku quand les runs similaires passés ont été rapides et sans erreur.' },
  { id: 't2', n: '2', model: 'claude-sonnet-4-6', usage: 'Frontend, specs, tâches standard', cost: '🟡 Moyen', nc: 'ct2', mc: '#F59E0B',
    detail: 'Équilibre qualité / coût pour la majorité des tâches frontend, rédaction de specs, design d\'API et revues de code standards. Tier par défaut pour classify qui retourne tier=2.' },
  { id: 't3', n: '3', model: 'claude-opus-4-8', usage: 'Backend complexe, review, architecture', cost: '🔴 Élevé', nc: 'ct3', mc: '#EF4444',
    detail: 'Réservé aux tâches à fort raisonnement : backend complexe, review d\'architecture, refactoring critique, debugging de race conditions.' },
]

export function TiersSection() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="sec center-text" id="tiers" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <div className="sec-label" style={{ justifyContent: 'center' }}>✦ Sélection de modèle</div>
        <h2 className="sec-h2">Trois tiers. Un seul optimal.</h2>
        <p className="sec-sub">Thompson Sampling choisit automatiquement le tier selon la complexité détectée et l'historique des runs.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="tier-table">
            <thead><tr><th>Tier</th><th>Modèle</th><th>Cas d'usage</th><th>Coût relatif</th></tr></thead>
            <tbody>
              {TIERS.map(t => (
                <React.Fragment key={t.id}>
                  <tr id={t.id} onClick={() => setOpen(open === t.id ? null : t.id)}>
                    <td><span className={t.nc} style={{ padding: '4px 12px', borderRadius: 8 }}>{t.n}</span></td>
                    <td style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, color: t.mc }}>{t.model}</td>
                    <td style={{ textAlign: 'left', color: 'var(--text-s)' }}>{t.usage}</td>
                    <td><span className={t.nc}>{t.cost}</span><span style={{ color: 'var(--primary)', fontSize: 11, marginLeft: 6 }}>{open === t.id ? '▲' : '▼'}</span></td>
                  </tr>
                  {open === t.id && (
                    <tr className="tier-detail open" id={t.id + '-detail'}>
                      <td colSpan={4}>{t.detail}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
