'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { ADRS } from '@/lib/adrs'
import { NAV_ITEMS } from '@/lib/docs-nav'

// ─── Client sub-components ────────────────────────────────────────────────────

function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1200
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
        const tick = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          setDisplayed(Math.round(easeOutCubic(progress) * to))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [to])

  return <span ref={ref} className={className}>{displayed}</span>
}

function DocsTerminal() {
  const lines = [
    { type: 'input', text: 'ada run "implement user invitation feature"' },
    { type: 'ok',    text: 'Classifying... [mode=pipeline, tier=2]' },
    { type: 'ok',    text: 'Phase 1/5: db-schema → agent:db',    badge: 'haiku' },
    { type: 'ok',    text: 'Phase 2/5: tdd-specs → agent:tester', badge: 'haiku' },
    { type: 'spin',  text: 'Phase 3/5: backend-impl → agent:nestjs', badge: 'opus' },
  ]
  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setVisible([])
      for (let i = 0; i < lines.length; i++) {
        await new Promise(r => setTimeout(r, i === 0 ? 300 : 500))
        if (cancelled) return
        setVisible(prev => [...prev, i])
      }
      await new Promise(r => setTimeout(r, 3000))
      if (!cancelled) run()
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="terminal">
      <div className="terminal-chrome">
        <div className="dot dot-red" />
        <div className="dot dot-yellow" />
        <div className="dot dot-green" />
        <span className="terminal-title">ada — zsh</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, i) => (
          <div
            key={i}
            className="terminal-line"
            style={{ opacity: visible.includes(i) ? 1 : 0, transition: 'opacity 0.25s' }}
          >
            {line.type === 'input' && (
              <>
                <span className="t-prompt">$</span>
                <span className="t-cmd">{line.text}</span>
              </>
            )}
            {line.type === 'ok' && (
              <>
                <span className="t-ok">✓</span>
                <span className="t-muted">{line.text}{line.badge && <span className={`t-badge-${line.badge}`}> [{line.badge}]</span>}</span>
              </>
            )}
            {line.type === 'spin' && (
              <>
                <span className="t-spin">⤸</span>
                <span className="t-muted">{line.text}{line.badge && <span className={`t-badge-${line.badge}`}> [{line.badge}]</span>}</span>
              </>
            )}
          </div>
        ))}
        <div className="terminal-line">
          <span className="t-cursor" />
        </div>
      </div>
    </div>
  )
}

// ─── Page renderers ───────────────────────────────────────────────────────────

function DocHome() {
  return (
    <>
      <div className="page-section hero" style={{ position: 'relative', padding: '60px 0 40px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '-50% -50%', pointerEvents: 'none', zIndex: 0 }}>
          <div className="doc-hero-bg1" />
          <div className="doc-hero-bg2" />
        </div>
        <div className="doc-hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-tag">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
            Agent Dispatch Architecture
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
            Orchestrate AI agents<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              at production scale
            </span>
          </h1>
          <p className="hero-sub" style={{ fontSize: 18, color: 'var(--text-s)', maxWidth: 560, marginBottom: 32, lineHeight: 1.6 }}>
            ADA routes tasks to the right Claude agent tier via Thompson Sampling, executes multi-phase pipelines as DAGs, and persists insights in a zero-dep SQLite ReasoningBank.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/docs/installation" className="btn-p" style={{ padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Get Started
            </Link>
            <a href="/ADA-v7.zip" download="ADA-v7.zip" className="btn-g" style={{ padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/><line x1="3" y1="21" x2="21" y2="21"/></svg>
              Download v7.2.0
            </a>
            <Link href="/docs/arch-overview" className="btn-g" style={{ padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Architecture
            </Link>
          </div>
          <DocsTerminal />
        </div>
      </div>

      <div className="page-section">
        <div className="cards-grid">
          {[
            { icon: '🎓', title: 'Thompson Sampling', desc: 'Probabilistic agent selection that improves with each run. Alpha/beta distributions converge to optimal routing over time.' },
            { icon: '🎛', title: 'DAG Pipelines', desc: 'Complex features decompose into phase graphs. Independent phases execute concurrently, reducing wall-clock time significantly.' },
            { icon: '📊', title: 'ReasoningBank', desc: 'Zero-dependency SQLite persistence for agent insights, project conventions, and routing history across all sessions.' },
          ].map(c => (
            <div key={c.title} className="doc-card">
              <span className="card-icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-section">
        <div className="metrics-strip">
          <div className="metric"><CountUp to={29} className="metric-value" /><span className="metric-label">Test Suites</span></div>
          <div className="metric"><CountUp to={650} className="metric-value" /><span className="metric-label">Assertions</span></div>
          <div className="metric"><CountUp to={107} className="metric-value" /><span className="metric-label">Benchmarks</span></div>
          <div className="metric"><span className="metric-value" style={{ fontSize: 22 }}>v7.2.0</span><span className="metric-label">Current Version</span></div>
        </div>
      </div>
    </>
  )
}

function StubPage({ title, desc, code }: { title: string; desc: string; code: string }) {
  return (
    <div className="page-section">
      <div className="stub-badge">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        En cours de rédaction
      </div>
      <h1>{title}</h1>
      <p>{desc}</p>
      <div className="code-block"><pre><code>{code}</code></pre></div>
    </div>
  )
}

function DocInstallation() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Quick Start <span>›</span> Installation</div>
      <div className="page-header">
        <h1>Installation</h1>
        <p>Une seule commande suffit — l'installeur télécharge ADA, vérifie les prérequis et configure tout automatiquement.</p>
      </div>

      {/* Curl one-liner — méthode recommandée */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: 12, padding: '24px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            color: 'var(--primary)', textTransform: 'uppercase',
            background: 'rgba(99,102,241,0.12)', padding: '2px 8px', borderRadius: 4,
          }}>Recommandé</span>
          <span style={{ fontSize: 13, color: 'var(--text-m)' }}>CLI + Serveur</span>
        </div>
        <div className="code-block" style={{ marginBottom: 12 }}>
          <pre><code>{`curl -fsSL https://ada.byarms.com/install.sh | bash -s -- --with-server`}</code></pre>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-s)', margin: 0 }}>
          Installe <strong>ada-core</strong> (CLI), <strong>ada-api</strong> (:3001) et <strong>ada-ui</strong> (:7777).
          Supprime le flag <code>--with-server</code> pour le CLI seul.
        </p>
      </div>

      <h2>Prérequis</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16 }}>
        ADA utilise <code>node:sqlite</code> introduit dans Node.js 22.5.0. Les versions antérieures ne sont pas supportées.
      </p>
      <div className="code-block">
        <pre><code>{`node --version
# Doit afficher v22.5.0 ou supérieur

# Si vous utilisez nvm
nvm install 22 && nvm use 22`}</code></pre>
      </div>
      <div className="callout callout-warn">
        <span className="callout-icon">⚠</span>
        <div className="callout-body">
          <strong>Node 20 LTS non supporté</strong>
          <p>Node.js 20 LTS n'inclut pas <code>node:sqlite</code>. La mise à jour vers Node 22 est obligatoire.</p>
        </div>
      </div>

      <h2>Ce que fait l'installeur</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16 }}>
        Le script vérifie les prérequis, télécharge la dernière release depuis GitHub, puis lance l'installeur interne.
      </p>

      <div className="stepper">
        <div className="doc-step">
          <div className="step-num">1</div>
          <div className="step-body">
            <h3>Vérification des prérequis</h3>
            <p style={{ color: 'var(--text-s)', fontSize: 14, marginBottom: 0 }}>
              Node.js 22+, curl, unzip. Le script s'arrête avec un message clair si un prérequis manque.
            </p>
          </div>
        </div>

        <div className="doc-step">
          <div className="step-num">2</div>
          <div className="step-body">
            <h3>Téléchargement de la dernière release</h3>
            <p style={{ color: 'var(--text-s)', fontSize: 14, marginBottom: 0 }}>
              Récupère automatiquement la version la plus récente depuis GitHub Releases.
            </p>
          </div>
        </div>

        <div className="doc-step">
          <div className="step-num">3</div>
          <div className="step-body">
            <h3>Installation</h3>
            <div className="code-block">
              <pre><code>{`# ✓ ada-core    — dépendances + symlink /usr/local/bin/ada
# ✓ ada-api     — npm install + compilation TypeScript
# ✓ ada-ui      — npm install + next build
# ✓ SQLite init + migrations
# ✓ Génération .env.local`}</code></pre>
            </div>
          </div>
        </div>

        <div className="doc-step">
          <div className="step-num">4</div>
          <div className="step-body">
            <h3>Démarrage automatique</h3>
            <div className="code-block">
              <pre><code>{`ada start server
# → ada-core  ✅  (socket .claude/ada-core.sock)
# → ada-api   ✅  (:3001, SQLite ada-api.db OK)
# → ada-ui    ✅  (:7777, connecté à ada-api)
# → Ouverture automatique sur http://localhost:7777`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="callout callout-success">
        <span className="callout-icon">✓</span>
        <div className="callout-body">
          <strong>ADA est prêt</strong>
          <p>L'interface s'ouvre automatiquement sur <code>http://localhost:7777</code>. Pour découvrir toutes les commandes disponibles, consultez la page <a href="/docs/commands" style={{ color: 'var(--primary)' }}>Commandes ADA</a>.</p>
        </div>
      </div>

      <h2>Installation manuelle (alternative)</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16 }}>
        Si vous préférez télécharger l'archive vous-même :
      </p>
      <div className="code-block">
        <pre><code>{`# 1. Télécharger
curl -O https://ada.byarms.com/ADA-v7.zip

# 2. Extraire et installer
unzip ADA-v7.zip && cd ADA-v7
bash install.sh --with-server

# 3. Démarrer
ada start server`}</code></pre>
      </div>

      <h2>Vérification</h2>
      <div className="code-block">
        <pre><code>{`ada --version
# → ADA v7.2.0 (node:sqlite ✓, node:crypto ✓, node:http ✓)

ada status
# → ada-core  ✅  running
# → ada-api   ✅  running (:3001)
# → ada-ui    ✅  running (:7777)`}</code></pre>
      </div>
    </div>
  )
}

function DocCommands() {
  const commands = [
    {
      group: 'Serveur & cycle de vie',
      color: 'var(--primary)',
      items: [
        {
          cmd: 'ada start server',
          desc: 'Démarre les 3 services ADA : ada-core, ada-api (:3001) et ada-ui (:7777). Ouvre automatiquement l\'interface dans le navigateur.',
          example: `ada start server
# → ada-core  ✅  (socket .claude/ada-core.sock)
# → ada-api   ✅  (:3001, SQLite ada-api.db OK)
# → ada-ui    ✅  (:7777, connecté à ada-api)`,
          flags: [
            { f: '--verbose', d: 'Affiche les logs combinés des 3 services en temps réel' },
            { f: '--no-open', d: 'Ne pas ouvrir le navigateur automatiquement' },
          ],
        },
        {
          cmd: 'ada stop',
          desc: 'Arrête proprement les 3 services ADA (SIGTERM → 2s grace period). Les données sont préservées.',
          example: `ada stop
# → ada-ui    stopped
# → ada-api   stopped
# → ada-core  stopped`,
          flags: [
            { f: '--force', d: 'SIGKILL immédiat si le shutdown prend plus de 5s' },
          ],
        },
        {
          cmd: 'ada status',
          desc: 'Affiche l\'état de santé de chaque service, les ports actifs et les métriques de base.',
          example: `ada status
# → ada-core  ✅  running  (uptime: 2h 14m)
# → ada-api   ✅  running  (:3001, 847 ms avg response)
# → ada-ui    ✅  running  (:7777)`,
          flags: [],
        },
        {
          cmd: 'ada update',
          desc: 'Met à jour ADA vers la dernière version disponible. Télécharge l\'archive, applique les migrations SQLite, redémarre les services.',
          example: `ada update
# → Checking latest version... v7.3.0 available
# → Downloading ADA-v7.3.0.zip...
# → Applying migrations...
# → Restarting services...
# → ✓ Updated to v7.3.0`,
          flags: [
            { f: '--dry-run', d: 'Affiche la version disponible sans installer' },
            { f: '--no-restart', d: 'Met à jour les fichiers sans redémarrer les services' },
          ],
        },
      ],
    },
    {
      group: 'Interface & navigation',
      color: 'var(--accent)',
      items: [
        {
          cmd: 'ada open',
          desc: 'Ouvre l\'interface ADA UI dans le navigateur par défaut. Démarre ada-ui si pas déjà en cours.',
          example: `ada open
# → Opening http://localhost:7777 ...`,
          flags: [
            { f: '--api', d: 'Ouvre l\'interface ada-api (port 3001) à la place' },
          ],
        },
        {
          cmd: 'ada launch',
          desc: 'Alias combiné : démarre le serveur si arrêté puis ouvre l\'interface. Commande la plus courante pour reprendre le travail.',
          example: `ada launch
# Si ADA n'est pas démarré :
# → Starting services...
# → Opening http://localhost:7777
# Si ADA est déjà démarré :
# → Already running. Opening http://localhost:7777`,
          flags: [],
        },
        {
          cmd: 'ada dashboard',
          desc: 'Ouvre le dashboard de monitoring embarqué sur le port 7821. Affiche les métriques Thompson Sampling, phases actives et usage tokens en temps réel via SSE.',
          example: `ada dashboard
# → Dashboard started: http://localhost:7821
# → SSE endpoint:     http://localhost:7821/events

ada dashboard --port 8080`,
          flags: [
            { f: '--port <n>', d: 'Port personnalisé (défaut : 7821)' },
          ],
        },
      ],
    },
    {
      group: 'Tâches & exécution',
      color: 'var(--green)',
      items: [
        {
          cmd: 'ada run "<description>"',
          desc: 'Lance une tâche de développement. ADA classifie automatiquement le prompt (solo vs pipeline), sélectionne les agents via Thompson Sampling et orchestre l\'exécution.',
          example: `ada run "implement user invitation feature"
# → Classifying... [mode=pipeline, tier=2]
# → ReasoningBank: 2 insights injectés
# → Phase 1/3: db-schema → agent:db [haiku]
# → Phase 2/3: backend   → agent:nestjs [opus]
# → Phase 3/3: tdd-specs → agent:tester [haiku]`,
          flags: [
            { f: '--solo', d: 'Force le mode 1 agent (ignore la classification)' },
            { f: '--tier <1|2|3>', d: 'Force un tier de modèle pour tous les agents' },
            { f: '--dry-run', d: 'Affiche le plan sans exécuter' },
            { f: '--json', d: 'Sortie JSON structurée pour CI/CD' },
          ],
        },
        {
          cmd: 'ada classify "<description>"',
          desc: 'Analyse un prompt et affiche comment ADA l\'interpréterait (mode, tier, profil, phases) sans exécuter.',
          example: `ada classify "add Stripe payment"
# → mode=pipeline  tier=2  profile=saas-builder
# → phases: [db-schema, backend-impl, frontend]`,
          flags: [
            { f: '--json', d: 'Sortie JSON avec score de confiance' },
          ],
        },
      ],
    },
    {
      group: 'Mémoire & ReasoningBank',
      color: 'var(--amber)',
      items: [
        {
          cmd: 'ada bank seed-conventions',
          desc: 'Initialise le ReasoningBank en lisant les conventions depuis CLAUDE.md. À exécuter une fois par projet.',
          example: `ada bank seed-conventions
# → Reading .claude/CLAUDE.md...
# → 12 conventions extracted
# → ReasoningBank seeded: 12 insights`,
          flags: [],
        },
        {
          cmd: 'ada bank recall "<query>"',
          desc: 'Recherche sémantique dans le ReasoningBank. Utile pour vérifier ce qu\'ADA sait déjà sur un sujet.',
          example: `ada bank recall "NestJS JWT authentication"
# → Insight 1 (score: 0.87): Always use PassportStrategy...
# → Insight 2 (score: 0.81): @UseGuards au niveau controller...`,
          flags: [
            { f: '--top <n>', d: 'Nombre de résultats (défaut : 3)' },
            { f: '--min-score <n>', d: 'Score minimum de pertinence (0–1)' },
          ],
        },
        {
          cmd: 'ada bank stats',
          desc: 'Affiche les statistiques du ReasoningBank : trajectoires, insights, distributions Thompson et taille de la DB.',
          example: `ada bank stats
# → Trajectories: 47
# → Insights: 31
# → Thompson distributions: 18
# → DB size: 2.4 MB`,
          flags: [],
        },
      ],
    },
    {
      group: 'Daemon & workers',
      color: 'var(--red)',
      items: [
        {
          cmd: 'ada daemon start',
          desc: 'Démarre le processus daemon en arrière-plan. Exécute les workers planifiés (ultralearn, consolidate, audit, cve-scan).',
          example: `ada daemon start
# → Daemon started (PID: 14832)
# → Log: logs/daemon.log`,
          flags: [],
        },
        {
          cmd: 'ada daemon stop',
          desc: 'Arrête le daemon proprement (SIGTERM + 2s grace).',
          example: `ada daemon stop
# → Daemon stopped`,
          flags: [],
        },
        {
          cmd: 'ada daemon status',
          desc: 'Vérifie si le daemon tourne et affiche l\'uptime.',
          example: `ada daemon status
# → running | uptime: 6h 42m`,
          flags: [],
        },
      ],
    },
  ]

  return (
    <div className="page-section">
      <div className="breadcrumb">Quick Start <span>›</span> Commandes ADA</div>
      <div className="page-header">
        <h1>Commandes ADA</h1>
        <p>Référence complète des commandes simplifiées du CLI ADA. Toutes les commandes sont disponibles après installation via <code>bash install.sh --with-server</code>.</p>
      </div>

      {/* Quick reference */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-m)', marginBottom: 14 }}>Référence rapide</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '6px 24px' }}>
          {[
            { cmd: 'ada start server', desc: 'Démarrer tous les services' },
            { cmd: 'ada stop', desc: 'Arrêter ADA' },
            { cmd: 'ada status', desc: 'État de santé' },
            { cmd: 'ada update', desc: 'Mettre à jour ADA' },
            { cmd: 'ada open', desc: 'Ouvrir l\'interface dans le navigateur' },
            { cmd: 'ada launch', desc: 'Démarrer + ouvrir (usage courant)' },
            { cmd: 'ada run "<task>"', desc: 'Lancer une tâche dev' },
            { cmd: 'ada classify "<task>"', desc: 'Analyser sans exécuter' },
            { cmd: 'ada dashboard', desc: 'Monitoring :7821' },
            { cmd: 'ada bank recall "<q>"', desc: 'Recherche dans la mémoire' },
            { cmd: 'ada daemon start', desc: 'Démarrer le daemon' },
            { cmd: 'ada daemon stop', desc: 'Arrêter le daemon' },
          ].map(r => (
            <div key={r.cmd} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <code style={{ fontSize: 12, color: 'var(--primary)', flexShrink: 0 }}>{r.cmd}</code>
              <span style={{ fontSize: 12, color: 'var(--text-m)' }}>— {r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {commands.map(group => (
        <div key={group.group} style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: group.color, flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: 18 }}>{group.group}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {group.items.map(item => (
              <div key={item.cmd} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-el)' }}>
                  <code style={{ fontSize: 14, fontWeight: 700, color: group.color }}>{item.cmd}</code>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ margin: 0, color: 'var(--text-s)', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>

                  <div className="code-block" style={{ margin: 0 }}>
                    <pre><code>{item.example}</code></pre>
                  </div>

                  {item.flags.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-m)', marginBottom: 8 }}>Options</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.flags.map(flag => (
                          <div key={flag.f} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '6px 10px', background: 'var(--code-bg)', borderRadius: 6 }}>
                            <code style={{ fontSize: 12, color: 'var(--accent)', flexShrink: 0 }}>{flag.f}</code>
                            <span style={{ fontSize: 12, color: 'var(--text-m)' }}>{flag.d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>Aide contextuelle</strong>
          <p>Chaque commande supporte <code>--help</code> : <code>ada run --help</code>, <code>ada bank --help</code>, etc.</p>
        </div>
      </div>
    </div>
  )
}

function DocConfiguration() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Quick Start <span>›</span> Configuration</div>
      <div className="page-header">
        <h1>Configuration</h1>
        <p>ADA reads its config from <code>.claude/coordinator/settings.json</code>. Created automatically on first run with defaults.</p>
      </div>

      <h2>Full settings.json</h2>
      <div className="code-block">
        <pre><code>{`{
  "version": "7.2.0",
  "routing": {
    "defaultMode": "solo",
    "maxAgents": 3,
    "thompsonColdStart": "random",
    "thompsonMinSamples": 5
  },
  "reasoningBank": {
    "dbPath": ".claude/coordinator/reasoning.db",
    "maxInsights": 3,
    "retrievalStrategy": "rrfmmr"
  },
  "tiers": {
    "1": "claude-haiku-4-5-20251001",
    "2": "claude-sonnet-4-6",
    "3": "claude-opus-4-8"
  },
  "plugins": {
    "dir": ".claude/plugins",
    "hmacVerify": true,
    "hotReload": false
  },
  "dashboard": {
    "enabled": true,
    "port": 7821,
    "broadcastInterval": 2000
  }
}`}</code></pre>
      </div>

      <h2>Key fields</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'routing.defaultMode', type: '"solo" | "pipeline"', desc: 'Default mode if classify returns no strong signal. Solo = 1 agent.' },
              { key: 'routing.maxAgents', type: 'number', desc: 'Hard limit on parallel agents. Prevents API quota overruns on complex pipelines.' },
              { key: 'thompsonMinSamples', type: 'number', desc: 'Minimum runs before Thompson Sampling replaces random cold-start routing.' },
              { key: 'reasoningBank.retrievalStrategy', type: '"tfidf" | "bm25" | "rrfmmr"', desc: 'rrfmmr (RRF + MMR) gives best retrieval quality (+22%).' },
              { key: 'plugins.hmacVerify', type: 'boolean', desc: 'Disable only during plugin development. Never disable in production.' },
            ].map(f => (
              <tr key={f.key}>
                <td><code>{f.key}</code></td>
                <td><code>{f.type}</code></td>
                <td>{f.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocFirstRun() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Quick Start <span>›</span> First Run</div>
      <div className="page-header">
        <h1>First Run</h1>
        <p>From install to shipped code in under 60 seconds. ADA handles classification, routing, orchestration, and learning automatically.</p>
      </div>

      <div className="stepper">
        <div className="doc-step">
          <div className="step-num">1</div>
          <div className="step-body">
            <h3>Run your first task</h3>
            <div className="code-block">
              <pre><code>{`cd my-nestjs-nextjs-project
ada run "add JWT authentication"
# → Classifying...  mode=pipeline  tier=2  profile=backend-nestjs
# → ReasoningBank: 0 insights (cold start)
# → Phase 1/3: db-schema → agent:db [haiku] θ=rand
# → Phase 2/3: backend   → agent:nestjs [opus] θ=rand
# → Phase 3/3: specs     → agent:tester [haiku] θ=rand
# → All phases complete. Updating Beta distributions.`}</code></pre>
            </div>
          </div>
        </div>
        <div className="doc-step">
          <div className="step-num">2</div>
          <div className="step-body">
            <h3>After 10 runs — Thompson Sampling takes over</h3>
            <div className="code-block">
              <pre><code>{`ada run "add email notification system"
# → Phase db-schema → agent:db [haiku]  θ=0.84 (α=7, β=1)
# → Phase backend   → agent:nestjs [opus]  θ=0.91 (α=9, β=0)
# → Phase specs     → agent:tester [haiku]  θ=0.78 (α=6, β=2)`}</code></pre>
            </div>
          </div>
        </div>
        <div className="doc-step">
          <div className="step-num">3</div>
          <div className="step-body">
            <h3>Useful follow-up commands</h3>
            <div className="code-block">
              <pre><code>{`ada bank stats        # Check ReasoningBank contents
ada dashboard         # Open monitoring UI at localhost:7821
ada run --solo "..."  # Force single-agent mode
ada run --tier 3 "..."  # Force a specific model tier`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>Cold start</strong>
          <p>At cold start θ is random (no history). From the 5th similar run onward, Thompson Sampling takes over and routes to the best-performing agents.</p>
        </div>
      </div>
    </div>
  )
}

function DocThompson() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Concepts <span>›</span> Thompson Sampling</div>
      <div className="page-header">
        <h1>Thompson Sampling</h1>
        <p>ADA uses Thompson Sampling to select the optimal agent for each phase. It is a multi-armed bandit algorithm with implicit exploration — it explores underrated agents while exploiting the best known ones.</p>
      </div>

      <h2>The Beta-Bernoulli model</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16 }}>
        Each <code>(phaseType, agentId)</code> pair maintains two counters: α (successes) and β (failures). These parameterize a Beta distribution.
      </p>
      <div className="diagram-wrap" style={{ textAlign: 'center' }}>
        <svg width="480" height="160" viewBox="0 0 480 160" style={{ overflow: 'visible', maxWidth: '100%' }}>
          {/* Haiku node */}
          <rect x="20" y="40" width="120" height="80" rx="10" fill="var(--surface)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"/>
          <text x="80" y="68" textAnchor="middle" fill="var(--green)" fontSize="11" fontFamily="monospace">haiku</text>
          <text x="80" y="86" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="monospace">θ=0.84</text>
          <text x="80" y="104" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">α=7 β=1</text>
          {/* Sonnet node */}
          <rect x="180" y="40" width="120" height="80" rx="10" fill="var(--surface)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"/>
          <text x="240" y="68" textAnchor="middle" fill="var(--amber)" fontSize="11" fontFamily="monospace">sonnet</text>
          <text x="240" y="86" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="monospace">θ=0.71</text>
          <text x="240" y="104" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">α=5 β=2</text>
          {/* Opus node */}
          <rect x="340" y="40" width="120" height="80" rx="10" fill="var(--surface)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5"/>
          <text x="400" y="68" textAnchor="middle" fill="var(--red)" fontSize="11" fontFamily="monospace">opus</text>
          <text x="400" y="86" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="monospace">θ=0.91</text>
          <text x="400" y="104" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">α=9 β=0</text>
          {/* Selected arrow */}
          <path d="M400 40 L400 20" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arr)"/>
          <text x="400" y="14" textAnchor="middle" fill="var(--primary)" fontSize="10" fontFamily="monospace">selected</text>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)"/>
            </marker>
          </defs>
        </svg>
        <p style={{ fontSize: 13, color: 'var(--text-m)', marginTop: 8, marginBottom: 0 }}>
          θ ~ Beta(α + 1, β + 1) — agent with highest sampled θ is selected
        </p>
      </div>

      <div className="code-block">
        <pre><code>{`function selectAgent(phaseType, candidates) {
  const samples = candidates.map(agent => {
    const { alpha, beta } = getDistribution(phaseType, agent.id)
    const theta = sampleBeta(alpha + 1, beta + 1)
    return { agent, theta }
  })
  return samples.sort((a, b) => b.theta - a.theta)[0].agent
}

function updateDistribution(phaseType, agentId, success) {
  const dist = getDistribution(phaseType, agentId)
  if (success) dist.alpha++
  else dist.beta++
  saveDistribution(phaseType, agentId, dist)
}`}</code></pre>
      </div>

      <div className="callout callout-success">
        <span className="callout-icon">✓</span>
        <div className="callout-body">
          <strong>Convergence</strong>
          <p>After ~20 runs on a task type, distributions converge and quality gains plateau. Projects with repetitive tasks (CRUD features, migrations, specs) converge fastest.</p>
        </div>
      </div>
    </div>
  )
}

function DocDAG() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Concepts <span>›</span> DAG Pipelines</div>
      <div className="page-header">
        <h1>DAG Pipelines</h1>
        <p>ADA pipelines are directed acyclic graphs. Each node is a phase, each edge a dependency. Phases without dependencies execute in parallel.</p>
      </div>

      <h2>Topologies</h2>
      <div className="cards-grid">
        {[
          { name: 'sequential', desc: 'Phases A → B → C. Each phase depends on the previous one. Use case: DB migrations then backend then frontend.' },
          { name: 'parallel_mesh', desc: 'Phases A, B, C are independent. All launched simultaneously. Use case: tasks with no cross-dependencies.' },
          { name: 'hybrid', desc: 'Mixed sequential/parallel. Phases A+B run in parallel, then C depends on both A and B. Most common case.' },
        ].map(t => (
          <div key={t.name} className="doc-card">
            <code style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 8, display: 'block' }}>{t.name}</code>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>

      <h2>Pipeline structure</h2>
      <div className="code-block">
        <pre><code>{`{
  "pipeline": "feature-fullstack",
  "topology": "hybrid",
  "phases": [
    { "id": "db-schema",     "agent": "db",     "tier": 1, "deps": [] },
    { "id": "tdd-specs",     "agent": "tester", "tier": 1, "deps": ["db-schema"] },
    { "id": "backend-impl",  "agent": "nestjs", "tier": 3, "deps": ["db-schema", "tdd-specs"] },
    { "id": "frontend",      "agent": "nextjs", "tier": 2, "deps": ["backend-impl"] }
  ]
}`}</code></pre>
      </div>
    </div>
  )
}

function DocReasoningBank() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Concepts <span>›</span> ReasoningBank</div>
      <div className="page-header">
        <h1>ReasoningBank</h1>
        <p>ADA's persistent memory layer. Stores execution trajectories, extracted insights, and Thompson Sampling Beta distributions in native SQLite (node:sqlite).</p>
      </div>

      <h2>Initialization</h2>
      <div className="code-block">
        <pre><code>{`ada bank seed-conventions   # Seed from CLAUDE.md conventions
ada bank stats
# → Trajectories: 0
# → Insights: 3 (from conventions)
# → Thompson distributions: 0
# → DB size: 12 KB`}</code></pre>
      </div>

      <h2>Semantic recall</h2>
      <div className="code-block">
        <pre><code>{`ada bank recall "JWT authentication NestJS"
# → Insight 1 (score: 0.87): Always use PassportStrategy with
#   JwtModule.registerAsync to load secrets from env.
# → Insight 2 (score: 0.81): @UseGuards(JwtAuthGuard) must be
#   applied at controller level, not module level.
# → Insight 3 (score: 0.74): refresh_token in httpOnly cookie,
#   access_token in client memory only.`}</code></pre>
      </div>

      <h2>SQLite schema</h2>
      <div className="code-block">
        <pre><code>{`CREATE TABLE trajectories (
  id TEXT PRIMARY KEY,
  task_description TEXT,
  pipeline TEXT,
  phases_json TEXT,
  quality_score REAL,
  duration_ms INTEGER,
  created_at INTEGER
);

CREATE TABLE insights (
  id TEXT PRIMARY KEY,
  content TEXT,
  source_trajectory TEXT REFERENCES trajectories(id),
  tfidf_vector TEXT,
  created_at INTEGER
);

CREATE TABLE thompson_distributions (
  phase_type TEXT,
  agent_id TEXT,
  alpha REAL DEFAULT 1,
  beta REAL DEFAULT 1,
  PRIMARY KEY (phase_type, agent_id)
);`}</code></pre>
      </div>
    </div>
  )
}

function DocCliRun() {
  return (
    <div className="page-section">
      <div className="breadcrumb">CLI Reference <span>›</span> ada run</div>
      <div className="page-header">
        <h1>ada run</h1>
        <p>Main command. Launches a development task — classification, routing, orchestration, feedback loop.</p>
      </div>

      <h2>Synopsis</h2>
      <div className="code-block">
        <pre><code>{'ada run [options] "<task description>"'}</code></pre>
      </div>

      <h2>Flags</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr><th>Flag</th><th>Description</th></tr>
          </thead>
          <tbody>
            {[
              { flag: '--solo', desc: 'Force solo mode (1 agent only), ignores classification.' },
              { flag: '--pipeline <name>', desc: 'Force a specific pipeline instead of auto-classification.' },
              { flag: '--tier <1|2|3>', desc: 'Force model tier for all agents in the run.' },
              { flag: '--dry-run', desc: 'Print the plan (phases, agents, tiers) without executing.' },
              { flag: '--no-bank', desc: 'Disable insight injection from the ReasoningBank.' },
              { flag: '--json', desc: 'Structured JSON output for CI/CD integration.' },
            ].map(opt => (
              <tr key={opt.flag}>
                <td><code>{opt.flag}</code></td>
                <td>{opt.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout callout-warn">
        <span className="callout-icon">⚠</span>
        <div className="callout-body">
          <strong>Default is solo</strong>
          <p>ADA defaults to single-agent mode. Multi-agent fan-out only triggers when <code>classify</code> returns <code>mode=pipeline</code>.</p>
        </div>
      </div>

      <h2>Examples</h2>
      <div className="code-block">
        <pre><code>{`# Standard run
ada run "implement RBAC permissions system"

# Dry run to validate the plan
ada run --dry-run "refactor auth module"
# → Plan: pipeline=backend-nestjs, phases=3, max-tier=3

# Forced solo for a quick fix
ada run --solo "fix timezone bug in scheduler"

# JSON output for CI
ada run --json "add integration tests" | jq '.phases'`}</code></pre>
      </div>
    </div>
  )
}

function DocCliClassify() {
  return (
    <div className="page-section">
      <div className="breadcrumb">CLI Reference <span>›</span> ada classify</div>
      <div className="page-header">
        <h1>ada classify</h1>
        <p>Classify a task description without executing it. Useful for understanding how ADA will interpret your prompt.</p>
      </div>

      <div className="code-block">
        <pre><code>{`ada classify "<description>"

ada classify "add full-text search to NestJS"
# → mode=pipeline  tier=2  profile=backend-nestjs
# → phases: [db-schema, backend-impl, tdd-specs]
# → signals: ["nestjs", "backend", "search"]

ada classify "fix pagination bug"
# → mode=solo  tier=1  profile=backend-nestjs
# → signals: ["fix", "bug"] → low complexity`}</code></pre>
      </div>

      <h2>JSON output</h2>
      <div className="code-block">
        <pre><code>{`ada classify --json "new Stripe payment feature"
# {
#   "mode": "pipeline",
#   "tier": 2,
#   "profile": "saas-builder",
#   "signals": ["stripe", "payment", "feature"],
#   "phases": ["db-schema", "backend-impl", "frontend", "tdd-specs"],
#   "confidence": 0.87
# }`}</code></pre>
      </div>
    </div>
  )
}

function DocCliBank() {
  return (
    <div className="page-section">
      <div className="breadcrumb">CLI Reference <span>›</span> ada bank</div>
      <div className="page-header">
        <h1>ada bank</h1>
        <p>Manage the ReasoningBank — seed, recall, stats, export.</p>
      </div>

      <div className="code-block">
        <pre><code>{`ada bank seed-conventions   # Seed from CLAUDE.md
ada bank recall "<query>"   # Semantic search
ada bank stats              # Bank statistics
ada bank export             # JSON export of all data
ada bank clear              # Clear the bank (irreversible)

# Recall with options
ada bank recall "NestJS JWT" --top 5 --min-score 0.7

# Export for backup
ada bank export > reasoning-bank-backup-$(date +%Y%m%d).json`}</code></pre>
      </div>
    </div>
  )
}

function DocCliDashboard() {
  return (
    <div className="page-section">
      <div className="breadcrumb">CLI Reference <span>›</span> ada dashboard</div>
      <div className="page-header">
        <h1>ada dashboard</h1>
        <p>Launch the embedded HTTP dashboard on port 7821 (configurable). No frontend dependencies — pure node:http with SSE.</p>
      </div>

      <div className="code-block">
        <pre><code>{`ada dashboard
# → Dashboard started: http://localhost:7821
# → SSE endpoint:     http://localhost:7821/events
# → API endpoint:     http://localhost:7821/api/state

ada dashboard --port 8080
curl http://localhost:7821/api/state | jq '.'`}</code></pre>
      </div>

      <h2>Exposed metrics</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {[
          'Active runs and in-progress phases',
          'Beta distributions by (phaseType, agentId)',
          'Cumulative token usage by tier',
          'P50/P95 latency by phase type',
          'ReasoningBank quality score histogram',
        ].map(m => (
          <li key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-s)', fontSize: 14 }}>
            <span style={{ color: 'var(--green)' }}>✓</span> {m}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DocRouting() {
  const [filter, setFilter] = useState('')

  const rows = [
    { kw: 'nestjs · next', profile: 'fullstack', agents: 'nestjs · nextjs · db' },
    { kw: 'drf · next', profile: 'fullstack-drf', agents: 'drf · nextjs · db' },
    { kw: 'frontend · next · react · ui', profile: 'frontend', agents: 'nextjs · ux-designer · reviewer' },
    { kw: 'nestjs', profile: 'backend-nestjs', agents: 'nestjs · db · tester' },
    { kw: 'drf · django · python', profile: 'backend-drf', agents: 'drf · db · tester' },
    { kw: 'react native · expo', profile: 'mobile-rn', agents: 'react-native · api-designer · reviewer' },
    { kw: 'android · swift · ios', profile: 'mobile-native', agents: 'android · swift · api-designer' },
    { kw: 'docker · deploy · ci', profile: 'devops', agents: 'devops · security-auditor · reviewer' },
    { kw: 'review · audit · perf', profile: 'review', agents: 'reviewer · security-auditor · performance-analyst' },
    { kw: 'architecture · conception', profile: 'strategy', agents: 'feature-architect · devils-advocate · api-designer' },
    { kw: 'ux · wireframe · design', profile: 'design', agents: 'ux-designer · technical-architect · data-modeler' },
    { kw: 'db · sql · migration', profile: 'data', agents: 'data-modeler · db · migration-strategist' },
    { kw: 'nouveau projet', profile: 'onboarding', agents: 'onboarding-agent · feature-architect · technical-architect' },
    { kw: 'saas · bootstrap · startup', profile: 'saas-builder', agents: 'technical-architect · db · devops' },
    { kw: 'llm · openai · deepseek', profile: 'ai-engineer', agents: 'ai-engineer · agent-architect · memory-engineer' },
    { kw: 'langgraph · agent · multi-agent', profile: 'ai-engineer', agents: 'ai-engineer · agent-architect · memory-engineer' },
    { kw: 'fastapi · async · sse · websocket', profile: 'ai-backend', agents: 'python-backend · ai-engineer · observability-engineer' },
    { kw: 'llama · ollama · gguf · quantization', profile: 'ai-infra', agents: 'ml-ops · perception-engineer · observability-engineer' },
    { kw: 'whisper · tts · piper · vad', profile: 'ai-infra', agents: 'ml-ops · perception-engineer · observability-engineer' },
    { kw: 'sandbox · restricted · code execution', profile: 'ai-security', agents: 'sandbox-security · security-auditor · observability-engineer' },
  ]

  const filtered = filter
    ? rows.filter(r => r.kw.includes(filter) || r.profile.includes(filter) || r.agents.includes(filter))
    : rows

  return (
    <div className="page-section">
      <div className="breadcrumb">Agents &amp; Routing <span>›</span> Routing Table</div>
      <div className="page-header">
        <h1>Routing Table</h1>
        <p>ADA detects the agent profile from prompt keywords. Default routing is solo (1 agent). Multi-agent fan-out triggers only when <code>classify</code> returns <code>mode=pipeline</code>.</p>
      </div>

      <div className="inline-search">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Filter by keyword, profile, or agents..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Keywords</th>
              <th>Profile</th>
              <th>Agents (pipeline)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td><span className="chip chip-cyan">{row.kw}</span></td>
                <td><span className="chip chip-primary">{row.profile}</span></td>
                <td style={{ color: 'var(--text-s)', fontSize: 13 }}>{row.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocAgents() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Agents &amp; Routing <span>›</span> Agent Profiles</div>
      <div className="page-header">
        <h1>Agent Profiles</h1>
        <p>ADA includes 15+ specialized agents. Each agent is an optimized Claude Code profile for a specific domain.</p>
      </div>

      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr><th>Agent</th><th>Tier</th><th>Description</th></tr>
          </thead>
          <tbody>
            {[
              { id: 'nestjs', tier: 3, desc: 'Expert NestJS/TypeScript — modules, services, DTOs, Prisma, Swagger' },
              { id: 'nextjs', tier: 2, desc: 'Expert Next.js 15/React 19 — App Router, RSC, Tailwind, shadcn/ui' },
              { id: 'db', tier: 1, desc: 'Expert PostgreSQL/Supabase — migrations SQL, RLS, index, schemas' },
              { id: 'tester', tier: 1, desc: 'Expert TDD — specs before code, Jest/pytest, Playwright, coverage' },
              { id: 'reviewer', tier: 3, desc: 'Expert code review — security, performance, architecture, verdict' },
              { id: 'security-auditor', tier: 2, desc: 'OWASP audit — injections, auth/authz, IDOR, CVE dependencies, secrets' },
              { id: 'ai-engineer', tier: 3, desc: 'LLM integration — Anthropic SDK, prompt caching, streaming, tool use' },
              { id: 'devops', tier: 2, desc: 'Docker multi-stage, GitHub Actions, AWS/Vercel/Railway' },
              { id: 'feature-architect', tier: 3, desc: 'Feature design — codebase analysis, DB schema, API contract, plan' },
            ].map(agent => (
              <tr key={agent.id}>
                <td><code>{agent.id}</code></td>
                <td>
                  <span className={`chip ${agent.tier === 1 ? 'chip-green' : agent.tier === 2 ? 'chip-amber' : 'chip-red'}`}>
                    tier {agent.tier}
                  </span>
                </td>
                <td>{agent.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocSecurityPlugins() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Security <span>›</span> Plugin Signing</div>
      <div className="page-header">
        <h1>Plugin Signing</h1>
        <p>All ADA plugins are verified by HMAC-SHA256 on load. Unsigned plugins are rejected — this protection is active by default and can only be disabled explicitly in development.</p>
      </div>

      <div className="callout callout-danger">
        <span className="callout-icon">🛡</span>
        <div className="callout-body">
          <strong>Never disable in production</strong>
          <p>Do not set <code>plugins.hmacVerify: false</code> in production. An unverified plugin can execute arbitrary code in your workspace.</p>
        </div>
      </div>

      <div className="stepper">
        <div className="doc-step">
          <div className="step-num">1</div>
          <div className="step-body">
            <h3>Generate a workspace key</h3>
            <div className="code-block">
              <pre><code>{`ada plugin keygen
# → Key stored at .claude/coordinator/plugin.key`}</code></pre>
            </div>
          </div>
        </div>
        <div className="doc-step">
          <div className="step-num">2</div>
          <div className="step-body">
            <h3>Sign a plugin</h3>
            <div className="code-block">
              <pre><code>{`ada plugin sign ./my-plugin/
# → HMAC-SHA256 signature added to ./my-plugin/manifest.json`}</code></pre>
            </div>
          </div>
        </div>
        <div className="doc-step">
          <div className="step-num">3</div>
          <div className="step-body">
            <h3>Verify the signature</h3>
            <div className="code-block">
              <pre><code>{`ada plugin verify ./my-plugin/
# → ✓ Signature valid (HMAC-SHA256)`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <h2>manifest.json structure</h2>
      <div className="code-block">
        <pre><code>{`{
  "id": "my-plugin",
  "version": "1.0.0",
  "entry": "index.js",
  "permissions": ["read:bank", "write:bank"],
  "signature": "hmac-sha256:a3f7c2...",
  "signedAt": "2025-06-22T10:00:00Z"
}`}</code></pre>
      </div>
    </div>
  )
}

function DocArchOverview() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Architecture <span>›</span> Overview</div>
      <div className="page-header">
        <h1>Architecture Overview</h1>
        <p>ADA is composed of 5 main modules communicating through narrow interfaces. No module depends directly on another — everything goes through strictly typed TypeScript interfaces.</p>
      </div>

      <div className="diagram-wrap">
        <svg width="100%" viewBox="0 0 700 200" style={{ maxWidth: '100%', overflow: 'visible' }}>
          {/* Coordinator */}
          <rect x="260" y="10" width="160" height="50" rx="8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5"/>
          <text x="340" y="32" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="monospace" fontWeight="600">Coordinator</text>
          <text x="340" y="48" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">coordinator/index.js</text>
          {/* Classifier */}
          <rect x="40" y="100" width="130" height="50" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="105" y="122" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="monospace" fontWeight="600">Classifier</text>
          <text x="105" y="138" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">classifier.js</text>
          {/* Router */}
          <rect x="190" y="100" width="130" height="50" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="255" y="122" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="monospace" fontWeight="600">Router</text>
          <text x="255" y="138" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">router.js</text>
          {/* ReasoningBank */}
          <rect x="340" y="100" width="150" height="50" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="415" y="122" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="monospace" fontWeight="600">ReasoningBank</text>
          <text x="415" y="138" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">bank.js</text>
          {/* Executor */}
          <rect x="500" y="100" width="130" height="50" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="565" y="122" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="monospace" fontWeight="600">Executor</text>
          <text x="565" y="138" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">executor.js</text>
          {/* SQLite */}
          <rect x="340" y="165" width="150" height="30" rx="6" fill="var(--code-bg)" stroke="var(--border)" strokeWidth="1"/>
          <text x="415" y="184" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">SQLite (node:sqlite)</text>
          {/* Arrows */}
          <line x1="340" y1="60" x2="105" y2="100" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1="340" y1="60" x2="255" y2="100" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1="340" y1="60" x2="415" y2="100" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1="420" y1="60" x2="565" y2="100" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1="415" y1="150" x2="415" y2="165" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,3"/>
        </svg>
      </div>

      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr><th>Module</th><th>File</th><th>Responsibility</th></tr>
          </thead>
          <tbody>
            {[
              { name: 'Coordinator', file: 'coordinator/index.js', desc: 'Entry point. Receives the task, orchestrates classification, routing, and feedback loop.' },
              { name: 'Classifier', file: 'coordinator/classifier.js', desc: 'TF-IDF scoring. Produces mode, tier, profile, signals from text description.' },
              { name: 'Router', file: 'coordinator/router.js', desc: 'Thompson Sampling. Selects optimal agent for each phase from Beta distributions.' },
              { name: 'ReasoningBank', file: 'coordinator/bank.js', desc: 'SQLite persistence. Trajectories, insights, distributions, conventions.' },
              { name: 'Executor', file: 'coordinator/executor.js', desc: 'Spawns Claude Code agents. Streaming EventEmitter. Collects outputs. Reports results.' },
            ].map(m => (
              <tr key={m.name}>
                <td><strong>{m.name}</strong></td>
                <td><code>{m.file}</code></td>
                <td>{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocArchHooks() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Architecture <span>›</span> Hooks System</div>
      <div className="page-header">
        <h1>Hooks System</h1>
        <p>ADA integrates with the Claude Code hooks system. Stop and PostToolUse are the two main integration points.</p>
      </div>

      <div className="code-block">
        <pre><code>{`// .claude/settings.json — ADA hooks
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": "node .claude/coordinator/hooks/stop.js" }]
    }],
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "node .claude/coordinator/hooks/post-tool.js" }]
    }]
  }
}`}</code></pre>
      </div>

      <h2>Stop hook</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16, fontSize: 14 }}>
        Triggered at the end of each agent session. Responsible for: updating Beta distributions (Thompson), extracting insights via LLM, saving the trajectory to SQLite.
      </p>

      <h2>PostToolUse hook</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16, fontSize: 14 }}>
        Triggered after each Bash tool call. Monitors intermediate outputs and can surface quality signals before the session ends.
      </p>
    </div>
  )
}

function DocADR({ adr }: { adr: typeof ADRS[0] }) {
  const statusCls = adr.status === 'Accepted'
    ? 'status-accepted'
    : adr.status === 'Proposed'
    ? 'status-proposed'
    : 'status-deprecated'

  const adrIndex = ADRS.findIndex(a => a.id === adr.id)
  const prev = ADRS[adrIndex - 1]
  const next = ADRS[adrIndex + 1]

  return (
    <div className="page-section">
      <div className="breadcrumb">ADRs <span>›</span> ADR-{adr.id}</div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span className={`status-badge ${statusCls}`}>{adr.status}</span>
          <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 12, color: 'var(--text-m)' }}>ADR-{adr.id}</span>
        </div>
        <h1>{adr.title}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'Context', content: adr.context },
          { label: 'Decision', content: adr.decision },
          { label: 'Consequences', content: adr.consequences },
        ].map(section => (
          <div key={section.label} style={{ background: 'var(--surface-el)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-m)', marginBottom: 10 }}>{section.label}</div>
            <p style={{ margin: 0, color: 'var(--text-s)', fontSize: 14, lineHeight: 1.7 }}>{section.content}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        {prev && (
          <Link href={`/docs/adr-${prev.id}`} className="btn-g" style={{ fontSize: 13, padding: '8px 16px' }}>
            ← ADR-{prev.id}
          </Link>
        )}
        {next && (
          <Link href={`/docs/adr-${next.id}`} className="btn-g" style={{ fontSize: 13, padding: '8px 16px' }}>
            ADR-{next.id} →
          </Link>
        )}
      </div>
    </div>
  )
}

function DocRelease720() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Releases <span>›</span> v7.2.0</div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 12, color: 'var(--text-m)' }}>2025-06-22</span>
          <span className="latest-badge">Latest</span>
        </div>
        <h1>v7.2.0</h1>
      </div>

      <div className="metrics-strip" style={{ marginBottom: 32 }}>
        <div className="metric"><CountUp to={29} className="metric-value" /><span className="metric-label">Test Suites</span></div>
        <div className="metric"><CountUp to={650} className="metric-value" /><span className="metric-label">Assertions</span></div>
        <div className="metric"><CountUp to={107} className="metric-value" /><span className="metric-label">Benchmarks</span></div>
        <div className="metric"><span className="metric-value" style={{ fontSize: 22 }}>0ms</span><span className="metric-label">Zero Dependencies</span></div>
      </div>

      {[
        { type: 'New', color: 'var(--green)', marker: '+', items: [
          'ADR-014: Graphify Knowledge Graph — entities, relations, clusters in SQLite',
          'SmartRetrieval RRF+MMR enabled by default (+22% retrieval quality)',
          'ada bank seed-conventions — automatic seeding from CLAUDE.md',
          'Dashboard: real-time Thompson Sampling graphs via SSE',
          'Plugin SDK: hot-reload in development mode',
        ]},
        { type: 'Improved', color: 'var(--accent)', marker: '↑', items: [
          'Cold start reduced from 340ms to 180ms (conventions cache)',
          'ReasoningBank: BM25 index rebuilt incrementally (vs full rebuild)',
        ]},
        { type: 'Fixed', color: 'var(--amber)', marker: '~', items: [
          'Deadlock on ada.lock with expired TTL',
          'Streaming EventEmitter: incorrect backpressure on high-volume agent output',
          'TF-IDF: vocabulary truncated on projects with >10k unique terms',
        ]},
      ].map(section => (
        <div key={section.type} className="changelog-group">
          <h3>
            <span className="chip" style={{ background: `${section.color}22`, color: section.color, border: `1px solid ${section.color}44` }}>{section.type}</span>
          </h3>
          <ul>
            {section.items.map((item, i) => (
              <li key={i}>
                <span style={{ color: section.color, flexShrink: 0 }}>{section.marker}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function DocRelease710() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Releases <span>›</span> v7.1.0</div>
      <div className="page-header">
        <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 12, color: 'var(--text-m)', display: 'block', marginBottom: 8 }}>2025-04-15</span>
        <h1>v7.1.0</h1>
      </div>

      {[
        { type: 'New', color: 'var(--green)', marker: '+', items: [
          'ADR-012: SmartRetrieval BM25 + TF-IDF via Reciprocal Rank Fusion',
          'ADR-011: HMAC-SHA256 plugin signing with audit trail',
          'ada plugin keygen / sign / verify — complete signing workflow',
          'Classifier: detection of AI profiles (llm, agent, multi-agent)',
          'ReasoningBank: JSON export/import for backup and migration',
        ]},
        { type: 'Fixed', color: 'var(--amber)', marker: '~', items: [
          'Thompson Sampling: division by zero on β=0 at cold start',
          'Classifier: false positives on "architecture" in file names',
        ]},
      ].map(section => (
        <div key={section.type} className="changelog-group">
          <h3>
            <span className="chip" style={{ background: `${section.color}22`, color: section.color, border: `1px solid ${section.color}44` }}>{section.type}</span>
          </h3>
          <ul>
            {section.items.map((item, i) => (
              <li key={i}>
                <span style={{ color: section.color, flexShrink: 0 }}>{section.marker}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function DocRelease700() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Releases <span>›</span> v7.0.0</div>
      <div className="page-header">
        <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 12, color: 'var(--text-m)', display: 'block', marginBottom: 8 }}>2025-02-01</span>
        <h1>v7.0.0</h1>
      </div>

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>Major version</strong>
          <p>Migrating from v6.x: run <code>ada migrate --from 6</code> to migrate the ReasoningBank to the new native SQLite schema.</p>
        </div>
      </div>

      {[
        { type: 'Breaking', color: 'var(--red)', marker: '!', items: [
          'Migration from better-sqlite3 to native node:sqlite (Node 22.5+)',
          'ReasoningBank API refactored — breaking change on ada.bank.*',
          'Pipeline format v2: "deps" field replaces "after"',
        ]},
        { type: 'New', color: 'var(--green)', marker: '+', items: [
          'ADR-006: native node:sqlite — removes better-sqlite3 dependency',
          'ADR-010: Streaming EventEmitter with backpressure',
          'ADR-008: Atomic Lock via O_EXCL — prevents state corruption',
          'ADR-007: Dashboard HTTP :7821 with SSE',
          'Thompson Sampling: first implementation (ADR-001)',
          'DAG Pipelines: sequential, parallel_mesh, hybrid topologies (ADR-002)',
        ]},
      ].map(section => (
        <div key={section.type} className="changelog-group">
          <h3>
            <span className="chip" style={{ background: `${section.color}22`, color: section.color, border: `1px solid ${section.color}44` }}>{section.type}</span>
          </h3>
          <ul>
            {section.items.map((item, i) => (
              <li key={i}>
                <span style={{ color: section.color, flexShrink: 0 }}>{section.marker}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// ─── NEW PAGES ────────────────────────────────────────────────────────────────

function DocArchPlatform() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Architecture <span>›</span> Platform Overview</div>
      <div className="page-header">
        <h1>Platform Overview</h1>
        <p>ADA is a three-tier platform. Each service owns exclusive data and communicates only through narrow, versioned contracts.</p>
      </div>

      <div className="diagram-wrap">
        <svg width="100%" viewBox="0 0 680 160" style={{ maxWidth: '100%', overflow: 'visible' }}>
          <rect x="20" y="20" width="180" height="120" rx="10" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5"/>
          <text x="110" y="50" textAnchor="middle" fill="var(--primary)" fontSize="12" fontFamily="monospace" fontWeight="700">ada-core</text>
          <text x="110" y="68" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">Node.js CLI</text>
          <text x="110" y="84" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">runs/ · bank.db</text>
          <text x="110" y="100" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">router-state.json</text>
          <text x="110" y="116" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">events.ndjson</text>
          <rect x="250" y="20" width="180" height="120" rx="10" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5"/>
          <text x="340" y="50" textAnchor="middle" fill="var(--accent)" fontSize="12" fontFamily="monospace" fontWeight="700">ada-api</text>
          <text x="340" y="68" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">Fastify 4 · :3001</text>
          <text x="340" y="84" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">SQLite/Drizzle</text>
          <text x="340" y="100" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">conversations</text>
          <text x="340" y="116" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">workspaces · sessions</text>
          <rect x="480" y="20" width="180" height="120" rx="10" fill="var(--surface)" stroke="var(--green)" strokeWidth="1.5"/>
          <text x="570" y="50" textAnchor="middle" fill="var(--green)" fontSize="12" fontFamily="monospace" fontWeight="700">ada-ui</text>
          <text x="570" y="68" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">Next.js 15 · :7777</text>
          <text x="570" y="84" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">React 19</text>
          <text x="570" y="100" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">TanStack Query</text>
          <text x="570" y="116" textAnchor="middle" fill="var(--text-m)" fontSize="10" fontFamily="monospace">Zustand · shadcn</text>
          <line x1="200" y1="80" x2="250" y2="80" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="225" y="73" textAnchor="middle" fill="var(--text-m)" fontSize="9" fontFamily="monospace">IPC</text>
          <line x1="430" y1="80" x2="480" y2="80" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="455" y="73" textAnchor="middle" fill="var(--text-m)" fontSize="9" fontFamily="monospace">REST+WS</text>
        </svg>
      </div>

      <h2>Authority by Domain</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Service</th><th>Owns</th><th>Port</th><th>Tech</th></tr></thead>
          <tbody>
            {[
              { s: 'ada-core', owns: 'runs/, bank.db, router-state.json, events.ndjson', port: 'none (IPC only)', tech: 'Node.js 22 CLI, CommonJS' },
              { s: 'ada-api', owns: 'conversations, workspaces, messages, sessions, run_links', port: ':3001 (REST + WS)', tech: 'Fastify 4, Drizzle ORM, SQLite WAL' },
              { s: 'ada-ui', owns: 'UI state only (Zustand, TanStack cache)', port: ':7777', tech: 'Next.js 15, React 19, Tailwind v4' },
            ].map(r => <tr key={r.s}><td><strong>{r.s}</strong></td><td style={{fontSize:13}}>{r.owns}</td><td><code>{r.port}</code></td><td style={{fontSize:13}}>{r.tech}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>IPC Event Flow</h2>
      <div className="code-block"><pre><code>{`# ada-core emits events via Unix socket
ada-core (.claude/ada-core.sock)
  → IPC NDJSON + HMAC
  → ada-api receives, upserts DB, broadcasts WebSocket
  → ada-ui receives via WS, updates Zustand store

# Fallback chain (3 layers)
Layer 1: Unix socket push   (always local mode)
Layer 2: TCP 127.0.0.1:3099 (server mode / socket absent)
Layer 3: FSWatch events.ndjson replay (IPC unavailable)`}</code></pre></div>

      <h2>Startup Order</h2>
      <div className="code-block"><pre><code>{`ada server start
# 1. ada-core daemon → wait .claude/ada-core.sock (timeout 10s)
# 2. ada-api → wait GET /api/health 200 (timeout 15s)
# 3. ada-ui → wait GET :7777 200 (timeout 20s)

ada server status
# → ada-core ✅  (socket .claude/ada-core.sock)
# → ada-api  ✅  (:3001, SQLite ada-api.db OK)
# → ada-ui   ✅  (:7777, connected to ada-api)`}</code></pre></div>

      <h2>Fault Isolation</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Service Down</th><th>Impact</th><th>Behavior</th></tr></thead>
          <tbody>
            {[
              { s: 'ada-ui', impact: 'UI inaccessible', b: 'ada-core & ada-api continue; runs not lost' },
              { s: 'ada-api', impact: 'UI disconnected; no new commands', b: 'ada-core continues current runs; NDJSON buffers events' },
              { s: 'ada-core', impact: 'No new runs', b: 'ada-api & ada-ui remain up; history browsable' },
            ].map(r => <tr key={r.s}><td><code>{r.s}</code></td><td>{r.impact}</td><td>{r.b}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocArchMemory() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Architecture <span>›</span> Memory & Graphify</div>
      <div className="page-header">
        <h1>Memory & Graphify</h1>
        <p>ADA's memory system combines ReasoningBank (SQLite), Smart Retrieval (BM25+RRF+MMR), Graphify (knowledge graph), and optional Obsidian integration.</p>
      </div>

      <h2>ReasoningBank Architecture (post-refactor)</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16, fontSize: 14 }}>Four problems solved in the v2 refactor:</p>
      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { n: 'P1 — Observable recall', d: 'Probe Ollama before retrieve, signal degraded mode to stderr, expose via bankHealth()' },
          { n: 'P2 — Acronym tokenizer', d: 'ACRONYMS_KEEP preserves ts, db, ui, api — NORMALIZE_MAP expands them before indexing' },
          { n: 'P3 — Content-only relevance', d: 'contentRelevance() scores query↔content only (no recency/verdict contamination)' },
          { n: 'P4 — Dedup at store', d: 'Jaccard ≥0.5 triggers last-write-wins; opposite polarity = WARNING, no auto-archive' },
        ].map(c => (
          <div key={c.n} className="doc-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 13, marginBottom: 6 }}>{c.n}</h3>
            <p style={{ fontSize: 13 }}>{c.d}</p>
          </div>
        ))}
      </div>

      <h2>Scope System</h2>
      <div className="code-block"><pre><code>{`// scope: global — injected unconditionally if on-topic
{ scope: 'global', content: 'Always use uuid PK on every table' }

// scope: domain — gated on contentRelevance > 0 threshold
{ scope: 'domain', content: 'NestJS: inject ConfigService, not process.env' }

// buildRecallBlockAsync — main entry point
const block = await buildRecallBlockAsync(query, { limit: 5 })
// → probes Ollama, retrieves, applies scope gating, caps LESSON_LIMIT=4`}</code></pre></div>

      <h2>Graphify — Knowledge Graph</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16, fontSize: 14 }}>
        Graphify (ADR-014) models tasks, files, agents, and outcomes as a property graph in SQLite. Edges represent causal and dependency relationships.
      </p>
      <div className="code-block"><pre><code>{`// graph-builder.js — node types
{ type: 'task',  id, title, status, cost, agentsInvolved[] }
{ type: 'file',  id, path, language }
{ type: 'agent', id, name, tier, p_win }

// edges
{ from, to, relation: 'modified' | 'depends_on' | 'produced_by' | 'linked' }

// query neighbors
const neighbors = graph.neighbors(nodeId, { depth: 2, types: ['file', 'task'] })`}</code></pre></div>

      <h2>Obsidian Integration</h2>
      <p style={{ color: 'var(--text-s)', marginBottom: 16, fontSize: 14 }}>
        ADA can write insights and run summaries directly to an Obsidian vault. Configure via Settings → Obsidian.
      </p>
      <div className="code-block"><pre><code>{`# ~/.ada.json
{
  "obsidian": {
    "vaultPath": "/Users/you/ObsidianVault",
    "enabled": true,
    "noteDir": "ada-runs",        // subfolder in vault
    "frontmatter": true           // add YAML frontmatter
  }
}

# Test the connection
ada obsidian test
# → Vault found: /Users/you/ObsidianVault ✓
# → Write permission: OK ✓

# Manual sync
ada obsidian sync --run <runId>`}</code></pre></div>

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>3D Graph in ADA UI</strong>
          <p>The Memory view in ada-ui renders a 3D force-directed graph (WebGL) of all Graphify nodes. Fallback to a 2D list on screens &lt;1024px or when WebGL is unavailable.</p>
        </div>
      </div>
    </div>
  )
}

function DocArchDaemon() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Architecture <span>›</span> Daemon Scheduler</div>
      <div className="page-header">
        <h1>Daemon Scheduler</h1>
        <p>The ADA daemon is a long-running background process that executes scheduled workers independently of active runs.</p>
      </div>

      <h2>Architecture</h2>
      <div className="code-block"><pre><code>{`ada daemon start
# Spawns: workers/daemon.js --daemon-worker (detached)
#   ├── PID file → logs/daemon.pid
#   ├── Log file → logs/daemon.log (daily rotation)
#   └── Timers via setTimeout + setInterval
#         ├── ultralearn  → every 6h
#         ├── consolidate → every 2h
#         ├── audit       → daily at midnight
#         └── cve-scan    → every 72h

ada daemon status   # running | stopped + uptime
ada daemon stop     # SIGTERM → graceful shutdown (2s grace period)
ada daemon logs     # tail logs/daemon.log`}</code></pre></div>

      <h2>Workers</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Worker</th><th>Frequency</th><th>Description</th></tr></thead>
          <tbody>
            {[
              { w: 'ultralearn', f: 'every 6h', d: 'Distill trajectories into patterns; update ReasoningBank' },
              { w: 'consolidate', f: 'every 2h', d: 'Merge duplicate insights, archive old trajectories' },
              { w: 'audit', f: 'daily midnight', d: 'OWASP security audit on plugins and hooks' },
              { w: 'cve-scan', f: 'every 72h', d: 'npm/pip CVE scan on project dependencies' },
              { w: 'dashboard', f: 'manual', d: 'Generate SVG performance dashboard' },
              { w: 'cost-report', f: 'manual', d: 'Detailed cost breakdown by agent/model' },
              { w: 'team-sync-push', f: 'auto (≥5 responses)', d: 'Sync Thompson priors to remote team registry' },
              { w: 'topic-wiki', f: 'manual', d: 'Generate wiki pages from trajectory clusters' },
            ].map(r => <tr key={r.w}><td><code>{r.w}</code></td><td style={{fontSize:13}}>{r.f}</td><td>{r.d}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Custom Schedule</h2>
      <div className="code-block"><pre><code>{`# ~/.ada.json — daemon.schedule overrides
{
  "daemon": {
    "schedule": {
      "ultralearn":  "4h",   // min 1m, max 7d
      "consolidate": "90m",
      "audit":       "48h",
      "cve-scan":    "7d"
    }
  }
}

# Supported formats: "6h" "30m" "90s" "2d"
# Run a worker manually now:
ada daemon run ultralearn`}</code></pre></div>

      <div className="callout callout-warn">
        <span className="callout-icon">⚠</span>
        <div className="callout-body">
          <strong>Graceful Shutdown</strong>
          <p>SIGTERM → clears all timers → unlinks daemon.pid → 2-second grace period → exits. Never send SIGKILL unless the daemon is stuck.</p>
        </div>
      </div>
    </div>
  )
}

function DocSmartRetrieval() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Concepts <span>›</span> Smart Retrieval</div>
      <div className="page-header">
        <h1>Smart Retrieval</h1>
        <p>Smart Retrieval is a 5-step re-ranking pipeline that combines BM25, query expansion, Reciprocal Rank Fusion, and Max Marginal Relevance to surface the most relevant ReasoningBank entries.</p>
      </div>

      <h2>Pipeline</h2>
      <div className="code-block"><pre><code>{`1. bank.retrieve(limit=10)       → BM25+TF-IDF candidates
2. expandQuery(maxVariants=3)    → 3 query reformulations
3. searchBM25 × 3 variants      → BM25 scoring per variant (k1=1.5, b=0.75)
4. reciprocalRankFusion(k=60)   → fuses 3 lists + recency boost
5. maximalMarginalRelevance(λ=0.6, topK=5) → diverse top 5`}</code></pre></div>

      <h2>Performance vs TF-IDF baseline</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Metric</th><th>Before (TF-IDF)</th><th>After (SmartRetrieval)</th></tr></thead>
          <tbody>
            {[
              { m: 'Candidates scanned', b: '5 000', a: '500 (RETRIEVE_CAP)' },
              { m: 'BM25 queries', b: '1', a: '3 (expand × 3)' },
              { m: 'Result diversity', b: 'low', a: 'high (MMR λ=0.6)' },
              { m: 'Retrieval quality (MRR@5)', b: '0.58', a: '0.74 (+27%)' },
              { m: 'Timeout guard', b: 'none', a: '2s hard cap' },
            ].map(r => <tr key={r.m}><td>{r.m}</td><td style={{color:'var(--text-m)'}}>{r.b}</td><td style={{color:'var(--green)'}}>{r.a}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Injection into Phase Context</h2>
      <div className="code-block"><pre><code>{`// Each phase receives acwContext when SmartRetrieval finds matches
phase.acwContext = {
  trajectories: [
    { id: 'run-abc', verdict: 'success', summary: '...', duration: '3m12s' },
  ],
  lesson: 'Always validate Zod schema before DB write',
  summary: 'Similar past runs: [run-abc, run-def] | avg success: 100% | avg: 3min',
  injected: true
}`}</code></pre></div>

      <h2>Configuration</h2>
      <div className="code-block"><pre><code>{`# ~/.ada.json
{
  "retrieval": {
    "enabled": true,
    "topK": 5,
    "mmrLambda": 0.6,      // 0=pure diversity, 1=pure relevance
    "timeoutMs": 2000,
    "expandVariants": 3,
    "bm25": { "k1": 1.5, "b": 0.75 }
  }
}`}</code></pre></div>
    </div>
  )
}

function DocApiOverview() {
  return (
    <div className="page-section">
      <div className="breadcrumb">ADA API <span>›</span> Overview</div>
      <div className="page-header">
        <h1>ADA API Overview</h1>
        <p>ada-api is the gateway between ada-core and ada-ui. It translates IPC events into WebSocket broadcasts, persists conversations and workspaces, and exposes a REST API for all UI actions.</p>
      </div>

      <h2>What ada-api owns</h2>
      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { t: 'Conversations', d: 'Chat threads with messages and run associations' },
          { t: 'Workspaces', d: 'Project isolation with settings and stats' },
          { t: 'Sessions', d: 'JWT auth tokens (revocable via /api/auth/session DELETE)' },
          { t: 'run_links', d: 'Bridge table linking ada-core run IDs to conversations' },
        ].map(c => (
          <div key={c.t} className="doc-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 13, marginBottom: 4 }}>{c.t}</h3>
            <p style={{ fontSize: 13 }}>{c.d}</p>
          </div>
        ))}
      </div>

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>What ada-api does NOT own</strong>
          <p>Runs, trajectories, phases, agents, configs, routing priors — all owned by ada-core. ada-api only stores metadata references (run IDs, status) via run_links.</p>
        </div>
      </div>

      <h2>Stack</h2>
      <div className="code-block"><pre><code>{`Runtime:   Node.js 22 LTS
Framework: Fastify 4.x
WebSocket: @fastify/websocket 8.x
ORM:       Drizzle ORM 0.30.x
Database:  SQLite (better-sqlite3 9.x) — WAL mode
Auth:      JWT via jose 5.x
IPC:       net.Socket (Unix domain or TCP)
Tests:     Vitest 1.x + supertest 7.x`}</code></pre></div>

      <h2>Quick Start</h2>
      <div className="code-block"><pre><code>{`# Start ada-api (part of ada server start)
ada server start

# Or standalone
cd ada-api && npm start

# Base URL
http://localhost:3001

# Get a JWT token
curl -X POST http://localhost:3001/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your-secret"}'
# → { "token": "eyJ...", "expiresIn": 3600 }`}</code></pre></div>

      <h2>Endpoint Groups</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Group</th><th>Base Path</th><th>Auth</th></tr></thead>
          <tbody>
            {[
              { g: 'Auth', p: '/api/auth/*', a: 'No (token endpoint)', link: 'api-rest' },
              { g: 'Health', p: '/api/health/*', a: 'No', link: 'api-rest' },
              { g: 'Workspaces', p: '/api/workspaces/*', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'Conversations', p: '/api/workspaces/:id/conversations', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'Messages', p: '/api/conversations/:id/messages', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'Runs', p: '/api/runs/*', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'Settings', p: '/api/settings', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'Stats', p: '/api/stats/*', a: 'Bearer JWT', link: 'api-rest' },
              { g: 'WebSocket', p: '/ws?ticket=<uuid>', a: 'One-time ticket', link: 'api-websocket' },
            ].map(r => <tr key={r.g}><td><strong>{r.g}</strong></td><td><code style={{fontSize:12}}>{r.p}</code></td><td style={{fontSize:13}}>{r.a}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocApiRest() {
  return (
    <div className="page-section">
      <div className="breadcrumb">ADA API <span>›</span> REST Reference</div>
      <div className="page-header">
        <h1>REST Reference</h1>
        <p>All endpoints use <code>http://localhost:3001</code> as base URL. Authentication is Bearer JWT except health and auth endpoints.</p>
      </div>

      <h2>Error Format</h2>
      <div className="code-block"><pre><code>{`{
  "error": {
    "code":    "CONVERSATION_NOT_FOUND",
    "message": "Conversation abc123 introuvable",
    "status":  404
  }
}`}</code></pre></div>

      <h2>Auth</h2>
      <div className="code-block"><pre><code>{`POST /api/auth/token          # get JWT (rate-limit: 10 req/15min)
POST /api/auth/refresh        # refresh expiring token
DELETE /api/auth/session      # logout (revoke token)
GET  /api/auth/me             # current session info`}</code></pre></div>

      <h2>Health</h2>
      <div className="code-block"><pre><code>{`GET /api/health               # global status {ok, version, uptime}
GET /api/health/core          # IPC connection detail
GET /api/health/db            # SQLite WAL stats`}</code></pre></div>

      <h2>Workspaces</h2>
      <div className="code-block"><pre><code>{`GET    /api/workspaces           # list workspaces
POST   /api/workspaces           # create workspace
GET    /api/workspaces/:id       # get workspace
PATCH  /api/workspaces/:id       # update (name, description, color)
DELETE /api/workspaces/:id       # delete
GET    /api/workspaces/:id/stats # usage stats (runs, cost, tokens)`}</code></pre></div>

      <h2>Conversations & Messages</h2>
      <div className="code-block"><pre><code>{`GET    /api/workspaces/:wid/conversations   # list conversations
POST   /api/workspaces/:wid/conversations   # create conversation
GET    /api/conversations/:id              # get conversation
PATCH  /api/conversations/:id              # update (title, pinned, archived)
DELETE /api/conversations/:id              # delete

GET    /api/conversations/:id/messages     # cursor-paginated messages
POST   /api/conversations/:id/messages     # send message

# Cursor pagination
GET /api/conversations/:id/messages?limit=50&direction=before&cursor=<id>`}</code></pre></div>

      <h2>Runs</h2>
      <div className="code-block"><pre><code>{`POST   /api/runs                # spawn run → 202 {runId}
GET    /api/runs/:id            # run state + phases
DELETE /api/runs/:id            # cancel (SIGTERM)
POST   /api/runs/:id/retry      # restart from failed phase

# Spawn a run
curl -X POST http://localhost:3001/api/runs \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{ "prompt": "implement user invitation", "profile": "fullstack", "conversationId": "conv-xxx" }'`}</code></pre></div>

      <h2>Settings & Stats</h2>
      <div className="code-block"><pre><code>{`GET   /api/settings                    # global instance settings
PATCH /api/settings                    # hot-reload (log_level, ws_heartbeat_interval)

GET   /api/stats/observe?window=7d     # usage stats (window: 7d|30d|session)
# → { pipelines: [...], daily: [...], topAgents: [...] }`}</code></pre></div>
    </div>
  )
}

function DocApiWebSocket() {
  return (
    <div className="page-section">
      <div className="breadcrumb">ADA API <span>›</span> WebSocket</div>
      <div className="page-header">
        <h1>WebSocket Protocol</h1>
        <p>ada-api exposes a WebSocket endpoint for real-time run events. Connection requires a one-time ticket obtained via REST.</p>
      </div>

      <h2>Two-step connection</h2>
      <div className="code-block"><pre><code>{`# Step 1: get a ticket (valid 30s, single-use)
curl -X GET http://localhost:3001/api/ws/ticket \\
  -H "Authorization: Bearer <jwt>"
# → { "ticket": "550e8400-...", "expiresAt": "2026-06-01T10:00:30Z" }

# Step 2: connect WebSocket
ws://localhost:3001/ws?ticket=<uuid>`}</code></pre></div>

      <h2>Message Envelope</h2>
      <div className="code-block"><pre><code>{`// All messages follow this envelope
{
  "type":    "<event_type>",
  "id":      "<uuid>",
  "ts":      1748686800000,
  "payload": { }
}`}</code></pre></div>

      <h2>Client → Server Commands</h2>
      <div className="code-block"><pre><code>{`join_room         { workspaceId }     // join workspace room
subscribe_run     { runId }           // subscribe to run events
unsubscribe_run   { runId }
cancel_run        { runId }           // SIGTERM on ada-core process
ping              {}                  // latency test`}</code></pre></div>

      <h2>Server → Client Events</h2>
      <div className="code-block"><pre><code>{`run:started               { runId, profile, conversationId }
run:phase:started         { runId, phase, agent, tier, model }
run:phase:progress        { runId, phase, log, tokens }
run:phase:completed       { runId, phase, cost, tokens, durationMs }
run:phase:failed          { runId, phase, error }
run:completed             { runId, totalCost, totalTokens, durationMs }
run:failed                { runId, error }
run:cancelled             { runId }
message:created           { conversationId, message }
conversation:updated      { conversationId }
core:status               { connected: boolean }
heartbeat                 { ts }      // every 30s`}</code></pre></div>

      <h2>Closure Codes</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Code</th><th>Meaning</th><th>Action</th></tr></thead>
          <tbody>
            {[
              { c: '1000', m: 'Normal Closure', a: "Don't reconnect" },
              { c: '1006', m: 'Abnormal Closure', a: 'Reconnect with backoff' },
              { c: '4001', m: 'Ticket Invalid', a: 'Get new ticket, reconnect' },
              { c: '4002', m: 'Token Expired', a: 'Refresh JWT, get new ticket' },
              { c: '4003', m: 'Rate Limited', a: 'Wait 60s' },
              { c: '4004', m: 'Session Revoked', a: 'Redirect to login' },
            ].map(r => <tr key={r.c}><td><code>{r.c}</code></td><td>{r.m}</td><td>{r.a}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Reconnection (exponential backoff)</h2>
      <div className="code-block"><pre><code>{`// Backoff: 0ms, 1s, 2s, 4s, 8s, 16s, max 30s
class AdaWebSocket {
  connect() {
    const ws = new WebSocket(\`ws://localhost:3001/ws?ticket=\${ticket}\`)
    ws.onclose = (e) => {
      if (e.code === 1000 || e.code === 4004) return // don't retry
      const delay = Math.min(1000 * 2 ** this.retries++, 30000)
      setTimeout(() => this.refreshTicket().then(() => this.connect()), delay)
    }
  }
}`}</code></pre></div>
    </div>
  )
}

function DocApiSchema() {
  return (
    <div className="page-section">
      <div className="breadcrumb">ADA API <span>›</span> DB Schema</div>
      <div className="page-header">
        <h1>DB Schema</h1>
        <p>ada-api uses SQLite via Drizzle ORM in WAL mode. 8 tables, idempotent migrations auto-applied on startup.</p>
      </div>

      <h2>SQLite Configuration</h2>
      <div className="code-block"><pre><code>{`PRAGMA journal_mode = WAL;      -- Concurrent reads/writes
PRAGMA synchronous = NORMAL;    -- Good perf/durability trade-off
PRAGMA foreign_keys = ON;       -- FK constraints active
PRAGMA temp_store = MEMORY;     -- Temp tables in RAM
PRAGMA mmap_size = 268435456;   -- 256 MB memory-mapped I/O
PRAGMA cache_size = -16000;     -- 16 MB cache`}</code></pre></div>

      <h2>Tables</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Table</th><th>PK</th><th>Key Fields</th><th>Notes</th></tr></thead>
          <tbody>
            {[
              { t: 'workspaces', pk: 'id TEXT', f: 'name, slug (unique), profile, color, project_dir, config JSON', n: 'Trigger: auto-update updated_at' },
              { t: 'conversations', pk: 'id TEXT', f: 'workspace_id FK, title, pinned, archived, run_count, last_run_id', n: 'Index: workspace_id, updated_at DESC' },
              { t: 'messages', pk: 'id TEXT', f: 'conversation_id FK, role, content, content_type, metadata JSON', n: 'Immutable — no updated_at. role: user|assistant|system|tool|error' },
              { t: 'run_links', pk: 'run_id TEXT', f: 'conversation_id FK RESTRICT, status, phases JSON, total_cost, total_tokens', n: 'status: running|completed|failed|cancelled|completed_with_errors' },
              { t: 'sessions', pk: 'id TEXT', f: 'token_hash (unique), expires_at', n: 'Hourly cleanup of expired sessions' },
              { t: 'workspace_settings', pk: '(workspace_id, key)', f: 'value JSON nullable', n: 'Reserved: auto_summary, default_model, notification_level, max_concurrent_runs' },
              { t: 'ipc_events', pk: 'id TEXT', f: 'type, payload JSON, processed boolean', n: 'Append-only audit log. 7-day purge of processed events' },
            ].map(r => <tr key={r.t}><td><code>{r.t}</code></td><td style={{fontSize:12}}><code>{r.pk}</code></td><td style={{fontSize:12}}>{r.f}</td><td style={{fontSize:12,color:'var(--text-m)'}}>{r.n}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Migrations</h2>
      <div className="code-block"><pre><code>{`# Generate migration from schema changes
npm run db:generate

# Apply migrations (also runs automatically on server start)
npm run db:migrate

# Config: drizzle.config.js
export default {
  schema: './src/db/schema.js',
  out:    './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: { url: process.env.ADA_DB_PATH }
}`}</code></pre></div>
    </div>
  )
}

function DocAdaUI() {
  return (
    <div className="page-section">
      <div className="breadcrumb">ADA UI <span>›</span> UI Overview</div>
      <div className="page-header">
        <h1>ADA UI Overview</h1>
        <p>ada-ui is a Next.js 15 interface for orchestrating AI agents. Design metaphor: mission control / cockpit — dense, technical, real-time.</p>
      </div>

      <div className="callout callout-info">
        <span className="callout-icon">ℹ</span>
        <div className="callout-body">
          <strong>Stack</strong>
          <p>Next.js 15 (App Router) · React 19 · TanStack Query v5 · Zustand v5 · shadcn/ui · Tailwind CSS v4. Port :7777. Connects to ada-api:3001 via REST + WebSocket.</p>
        </div>
      </div>

      <h2>Navigation (by frequency)</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Section</th><th>Status</th><th>Description</th></tr></thead>
          <tbody>
            {[
              { s: 'Dashboard', st: 'Partial', d: '4 KPI cards (daemon, runs, cost, budget) · run timeline · Thompson priors table · activity heatmap' },
              { s: 'Workspaces', st: 'Planned', d: 'Conversation list · chat composer · run cards · streaming console (xterm-like) · phase accordion' },
              { s: 'Agents / Profiles', st: 'Live', d: 'Searchable agent list (tier, p(win), cost) · profile list + activate · detail drawer' },
              { s: 'Memory', st: 'Planned', d: '3D force-graph (WebGL) of Graphify nodes + wiki pane · node click to expand · Obsidian notes' },
              { s: 'Pipelines', st: 'Planned', d: 'DAG visualizer (phases, agents, tiers, dependencies, status, cost)' },
              { s: 'MCP', st: 'Planned', d: 'Connected servers list · catalogue · add/edit modal with masked secrets' },
              { s: 'Logs', st: 'Partial', d: 'Live tail + pause · filter by source/level/run · virtualized table · expand row for stacktrace' },
              { s: 'Settings', st: 'Partial', d: 'Providers · Budget · Obsidian · Webhook · Advanced tabs' },
            ].map(r => (
              <tr key={r.s}>
                <td><strong>{r.s}</strong></td>
                <td><span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: r.st === 'Live' ? 'rgba(16,185,129,0.12)' : r.st === 'Partial' ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)', color: r.st === 'Live' ? 'var(--green)' : r.st === 'Partial' ? 'var(--amber)' : 'var(--text-m)' }}>{r.st}</span></td>
                <td style={{ fontSize: 13 }}>{r.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Design System</h2>
      <div className="code-block"><pre><code>{`// Semantic status tokens (used throughout)
idle / queued    → #64748B slate  ○
running / live   → #22C55E green  ◉ (animated pulse)
success          → #10B981 emerald ✓
warning / budget → #F59E0B amber  △
failed / error   → #EF4444 red   ✕
paused           → #A855F7 violet ‖

// Model tier colors
haiku  (T1)  → #38BDF8 sky    (fast / light)
sonnet (T2)  → #A78BFA violet (standard)
opus   (T3)  → #FB923C orange (heavy reasoning)`}</code></pre></div>

      <h2>Key UI Principles</h2>
      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { t: 'Controlled density', d: 'Show much without saturation — hierarchy by size/spacing/contrast, never color alone' },
          { t: 'Real-time readable', d: 'Streaming tokens/phases/costs are instant with no CLS (Cumulative Layout Shift)' },
          { t: 'Status always visible', d: 'Semantic states (idle/running/success/failed/paused) consistent everywhere' },
          { t: 'Keyboard-first', d: '⌘K palette, keyboard nav, shortcuts on frequent actions; AA contrast minimum' },
        ].map(c => (
          <div key={c.t} className="doc-card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 13, marginBottom: 4 }}>{c.t}</h3>
            <p style={{ fontSize: 13 }}>{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocDeployLocal() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Deployment <span>›</span> Local Setup</div>
      <div className="page-header">
        <h1>Local Setup</h1>
        <p>Local mode runs all three services on your machine. No network auth required — loopback only. Ideal for personal use and development.</p>
      </div>

      <h2>Prerequisites</h2>
      <div className="code-block"><pre><code>{`Node.js >= 22.0.0
npm >= 10.0.0
ANTHROPIC_API_KEY (env var)

# Install Claude Code if not already present
npm install -g @anthropic-ai/claude-code`}</code></pre></div>

      <h2>Installation</h2>
      <div className="code-block"><pre><code>{`git clone https://github.com/jonathanARMS23/AI-Dev-Assistant.git
cd AI-Dev-Assistant

bash install.sh --with-server
# Does:
#   1. npm install            (ada-core)
#   2. npm install + tsc      (ada-api)
#   3. npm install + next build (ada-ui)
#   4. SQLite init + migrations
#   5. Generate .env.local for ada-ui
#   6. Symlink /usr/local/bin/ada → .claude/bin/ada.js`}</code></pre></div>

      <h2>Start / Stop</h2>
      <div className="code-block"><pre><code>{`ada server start            # start all 3 services
ada server start --verbose  # combined logs to stdout
ada server status           # show health of each service
ada server stop             # graceful shutdown
ada server restart ada-api  # restart a single service`}</code></pre></div>

      <h2>Default Ports</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Service</th><th>Endpoint</th><th>Env Var</th></tr></thead>
          <tbody>
            {[
              { s: 'ada-core IPC (local)', e: '.claude/ada-core.sock', v: 'ADA_IPC_SOCKET' },
              { s: 'ada-core IPC (server)', e: '127.0.0.1:3099', v: 'ADA_IPC_PORT' },
              { s: 'ada-api REST + WS', e: 'http://localhost:3001', v: 'ADA_API_PORT' },
              { s: 'ada-ui', e: 'http://localhost:7777', v: 'ADA_UI_PORT' },
            ].map(r => <tr key={r.s}><td>{r.s}</td><td><code>{r.e}</code></td><td><code>{r.v}</code></td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Generated Files</h2>
      <div className="code-block"><pre><code>{`~/.claude-<profile>/
├── ada-api.db          # SQLite (conversations, workspaces)
└── ada-api.db-wal      # WAL file (auto-created)

.env.local              # Next.js vars (NEXT_PUBLIC_API_URL, etc.)
.claude/
├── ada-core.sock       # Unix socket IPC (created on startup)
└── events.ndjson       # Append-only IPC journal`}</code></pre></div>
    </div>
  )
}

function DocDeployServer() {
  return (
    <div className="page-section">
      <div className="breadcrumb">Deployment <span>›</span> Server / Docker</div>
      <div className="page-header">
        <h1>Server / Docker Deployment</h1>
        <p>Server mode runs ADA on a VPS or cloud instance with Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL. JWT auth mandatory.</p>
      </div>

      <h2>Server Prerequisites</h2>
      <div className="code-block"><pre><code>{`OS: Ubuntu 22.04+ or Debian 12+
RAM: 2 GB min, 4 GB recommended
CPU: 2 vCPU min
Ports: 80, 443 open inbound

# Node.js 22 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22 && nvm use 22

# Docker + Docker Compose
curl -fsSL https://get.docker.com | sh

# Nginx
apt install nginx certbot python3-certbot-nginx`}</code></pre></div>

      <h2>Server Installation</h2>
      <div className="code-block"><pre><code>{`git clone https://github.com/jonathanARMS23/AI-Dev-Assistant.git /opt/ada
cd /opt/ada

ada server init --remote \\
  --domain ada.your-domain.com \\
  --email admin@your-domain.com
# Generates docker-compose.yml, nginx.conf, .env.server, ssl/

nano .env.server   # Edit ANTHROPIC_API_KEY + ADA_JWT_SECRET before deploying

ada server deploy
# → docker compose up --build -d
# → certbot --nginx -d ada.your-domain.com
# → nginx -s reload
# → Health check verification`}</code></pre></div>

      <h2>Required Env Variables</h2>
      <div className="table-wrap">
        <table className="doc-table">
          <thead><tr><th>Variable</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            {[
              { v: 'ANTHROPIC_API_KEY', r: 'yes', d: 'Anthropic API key (sk-ant-...)' },
              { v: 'ADA_JWT_SECRET', r: 'yes', d: 'JWT HS256 secret — min 64 chars. Generate: openssl rand -hex 32' },
              { v: 'ADA_DB_PATH', r: 'no', d: 'SQLite path (default: /data/ada-api.db)' },
              { v: 'ADA_IPC_PORT', r: 'no', d: 'IPC TCP port (default: 3099, inter-container)' },
              { v: 'ADA_API_PORT', r: 'no', d: 'REST+WS port (default: 3001)' },
              { v: 'ADA_UI_PORT', r: 'no', d: 'Next.js port (default: 7777)' },
            ].map(r => <tr key={r.v}><td><code>{r.v}</code></td><td>{r.r}</td><td>{r.d}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>Nginx Config (generated)</h2>
      <div className="code-block"><pre><code>{`# /etc/nginx/sites-available/ada
server {
  listen 443 ssl;
  server_name ada.your-domain.com;

  location / {
    proxy_pass http://localhost:7777;    # ada-ui
  }

  location /api {
    proxy_pass http://localhost:3001;   # ada-api REST
  }

  location /ws {
    proxy_pass http://localhost:3001;   # ada-api WebSocket
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}`}</code></pre></div>

      <div className="callout callout-warn">
        <span className="callout-icon">⚠</span>
        <div className="callout-body">
          <strong>Security in server mode</strong>
          <p>JWT auth is mandatory. CORS + Origin check enforced. IPC is TCP loopback-only (127.0.0.1:3099) — never exposed to the network. Never commit <code>.env.server</code> to version control.</p>
        </div>
      </div>
    </div>
  )
}

function DocGeneric({ slug }: { slug: string }) {
  const item = NAV_ITEMS.find(i => i.slug === slug)
  return (
    <StubPage
      title={item?.title ?? slug}
      desc={`Documentation for ${item?.title ?? slug} is being written.`}
      code={`# Coming soon\nada ${slug} --help`}
    />
  )
}

// ─── Shimmer + Copy buttons (runs after each page render) ───────────────────

function useDocEffects(slug: string) {
  useEffect(() => {
    // 1. Copy buttons
    document.querySelectorAll('.code-block').forEach(block => {
      if (block.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        const code = block.querySelector('code, pre')?.textContent ?? ''
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!'
          btn.classList.add('copied')
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied') }, 2000)
        }).catch(() => {})
      })
      block.appendChild(btn)
    })

    // 2. Shimmer on scroll-into-view
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('shimmer')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.3 })

    document.querySelectorAll('.code-block').forEach(b => observer.observe(b))
    return () => observer.disconnect()
  }, [slug])
}

// ─── Route ────────────────────────────────────────────────────────────────────

export function DocPageClient() {
  const params = useParams()
  const slugArr = params?.slug as string[] | undefined
  const slug = slugArr ? slugArr.join('/') : ''

  useDocEffects(slug)

  function renderContent() {
    if (slug === '') return <DocHome />
    if (slug === 'installation') return <DocInstallation />
    if (slug === 'commands') return <DocCommands />
    if (slug === 'configuration') return <DocConfiguration />
    if (slug === 'first-run') return <DocFirstRun />
    if (slug === 'concepts-thompson') return <DocThompson />
    if (slug === 'concepts-dag') return <DocDAG />
    if (slug === 'concepts-reasoningbank') return <DocReasoningBank />
    if (slug === 'cli-run') return <DocCliRun />
    if (slug === 'cli-classify') return <DocCliClassify />
    if (slug === 'cli-bank') return <DocCliBank />
    if (slug === 'cli-dashboard') return <DocCliDashboard />
    if (slug === 'routing') return <DocRouting />
    if (slug === 'agents') return <DocAgents />
    if (slug === 'agents-custom') return <DocGeneric slug={slug} />
    if (slug === 'security-plugins') return <DocSecurityPlugins />
    if (slug === 'security-sandbox') return <DocGeneric slug={slug} />
    if (slug === 'arch-platform') return <DocArchPlatform />
    if (slug === 'arch-overview') return <DocArchOverview />
    if (slug === 'arch-coordinator') return <DocGeneric slug={slug} />
    if (slug === 'arch-memory') return <DocArchMemory />
    if (slug === 'arch-daemon') return <DocArchDaemon />
    if (slug === 'arch-hooks') return <DocArchHooks />
    if (slug === 'concepts-smartretrieval') return <DocSmartRetrieval />
    if (slug === 'api-overview') return <DocApiOverview />
    if (slug === 'api-rest') return <DocApiRest />
    if (slug === 'api-websocket') return <DocApiWebSocket />
    if (slug === 'api-schema') return <DocApiSchema />
    if (slug === 'ada-ui') return <DocAdaUI />
    if (slug === 'deploy-local') return <DocDeployLocal />
    if (slug === 'deploy-server') return <DocDeployServer />
    if (slug === 'release-720') return <DocRelease720 />
    if (slug === 'release-710') return <DocRelease710 />
    if (slug === 'release-700') return <DocRelease700 />

    const adrMatch = slug.match(/^adr-(\d+)$/)
    if (adrMatch) {
      const adrId = adrMatch[1]
      const adr = ADRS.find(a => a.id === adrId)
      if (adr) return <DocADR adr={adr} />
    }

    const isValid = NAV_ITEMS.some(i => i.slug === slug)
    if (isValid) return <DocGeneric slug={slug} />
    return <DocGeneric slug={slug} />
  }

  return (
    <DocsLayout>
      {renderContent()}
    </DocsLayout>
  )
}

