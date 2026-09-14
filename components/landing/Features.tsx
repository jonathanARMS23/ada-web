import { BrainCircuit, Boxes, Fingerprint, Gauge, ShieldCheck, Workflow } from 'lucide-react'

const PILLARS = [
  { icon: Boxes, n: '01', title: 'Un noyau, plusieurs moteurs', desc: 'ADA normalise l’exécution de Claude Code et Codex derrière des contrats communs, tout en conservant leurs identités, capacités et modèles natifs.' },
  { icon: BrainCircuit, n: '02', title: 'Une mémoire qui reste', desc: 'Conventions, décisions et leçons sont rappelées par projet. Le contexte utile traverse les sessions sans repartir de zéro.' },
  { icon: Workflow, n: '03', title: 'Du prompt au système', desc: 'Classification, pipelines, phases, événements et résultats structurent le travail agentique en un processus d’ingénierie lisible.' },
  { icon: ShieldCheck, n: '04', title: 'Des garde-fous d’exécution', desc: 'Permissions centralisées, isolation des credentials, refus explicites et bail d’écriture empêchent les faux succès et les collisions.' },
  { icon: Gauge, n: '05', title: 'Une exploitation observable', desc: 'Runs, tentatives, usage et états terminaux produisent une trace exploitable par l’API et l’interface ADA.' },
  { icon: Fingerprint, n: '06', title: 'Une identité de bout en bout', desc: 'Projet, session, moteur, run et tentative restent corrélés pour comprendre qui a fait quoi, où et avec quel résultat.' },
]

export function Features() { return <section className="sec os-section" id="platform"><div className="wrap"><div className="section-heading"><div><div className="sec-label">LE SYSTÈME D’EXPLOITATION</div><h2 className="sec-h2">Plus qu’un orchestrateur.<br />La couche qui rend l’IA industrialisable.</h2></div><p className="sec-sub">Les modèles produisent. ADA organise les conditions pour produire de façon répétable, contrôlée et capitalisable.</p></div><div className="pillar-grid">{PILLARS.map(({ icon: Icon, n, title, desc }) => <article className="pillar" key={title}><div className="pillar-top"><span>{n}</span><Icon size={22} /></div><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section> }
