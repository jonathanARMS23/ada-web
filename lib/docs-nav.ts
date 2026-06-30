export type NavItem = {
  slug: string
  title: string
  group: string
}

export const NAV_ITEMS: NavItem[] = [
  // Navigation
  { slug: '', title: 'Home', group: 'Navigation' },

  // Quick Start
  { slug: 'installation', title: 'Installation', group: 'Quick Start' },
  { slug: 'commands', title: 'Commandes ADA', group: 'Quick Start' },
  { slug: 'configuration', title: 'Configuration', group: 'Quick Start' },
  { slug: 'first-run', title: 'First Run', group: 'Quick Start' },

  // Architecture
  { slug: 'arch-platform', title: 'Platform Overview', group: 'Architecture' },
  { slug: 'arch-coordinator', title: 'Coordinator', group: 'Architecture' },
  { slug: 'arch-memory', title: 'Memory & Graphify', group: 'Architecture' },
  { slug: 'arch-daemon', title: 'Daemon Scheduler', group: 'Architecture' },
  { slug: 'arch-hooks', title: 'Hooks System', group: 'Architecture' },

  // Concepts
  { slug: 'concepts-thompson', title: 'Thompson Sampling', group: 'Concepts' },
  { slug: 'concepts-dag', title: 'DAG Pipelines', group: 'Concepts' },
  { slug: 'concepts-reasoningbank', title: 'ReasoningBank', group: 'Concepts' },
  { slug: 'concepts-smartretrieval', title: 'Smart Retrieval', group: 'Concepts' },
  { slug: 'concepts-engineering-loop', title: 'AI Engineering Loop', group: 'Concepts' },

  // CLI Reference
  { slug: 'cli-run', title: 'ada run', group: 'CLI Reference' },
  { slug: 'cli-classify', title: 'ada classify', group: 'CLI Reference' },
  { slug: 'cli-bank', title: 'ada bank', group: 'CLI Reference' },
  { slug: 'cli-dashboard', title: 'ada dashboard', group: 'CLI Reference' },

  // ADA API
  { slug: 'api-overview', title: 'Overview', group: 'ADA API' },
  { slug: 'api-rest', title: 'REST Reference', group: 'ADA API' },
  { slug: 'api-websocket', title: 'WebSocket', group: 'ADA API' },
  { slug: 'api-schema', title: 'DB Schema', group: 'ADA API' },

  // ADA UI
  { slug: 'ada-ui', title: 'UI Overview', group: 'ADA UI' },

  // Agents & Routing
  { slug: 'routing', title: 'Routing Table', group: 'Agents & Routing' },
  { slug: 'agents', title: 'Agent Profiles', group: 'Agents & Routing' },
  { slug: 'agents-custom', title: 'Custom Agents', group: 'Agents & Routing' },

  // Security
  { slug: 'security-plugins', title: 'Plugin Signing', group: 'Security' },
  { slug: 'security-sandbox', title: 'Sandbox', group: 'Security' },

  // Deployment
  { slug: 'deploy-local', title: 'Local Setup', group: 'Deployment' },
  { slug: 'deploy-server', title: 'Server / Docker', group: 'Deployment' },

  // ADRs
  { slug: 'adr-001', title: 'ADR-001 Thompson Sampling', group: 'ADRs' },
  { slug: 'adr-002', title: 'ADR-002 DAG Pipelines', group: 'ADRs' },
  { slug: 'adr-003', title: 'ADR-003 SQLite ReasoningBank', group: 'ADRs' },
  { slug: 'adr-004', title: 'ADR-004 TF-IDF Embeddings', group: 'ADRs' },
  { slug: 'adr-005', title: 'ADR-005 Plugin SDK', group: 'ADRs' },
  { slug: 'adr-006', title: 'ADR-006 node:sqlite', group: 'ADRs' },
  { slug: 'adr-007', title: 'ADR-007 Dashboard HTTP', group: 'ADRs' },
  { slug: 'adr-008', title: 'ADR-008 Atomic Lock', group: 'ADRs' },
  { slug: 'adr-009', title: 'ADR-009 Agent Booster', group: 'ADRs' },
  { slug: 'adr-010', title: 'ADR-010 Streaming', group: 'ADRs' },
  { slug: 'adr-011', title: 'ADR-011 HMAC Signing', group: 'ADRs' },
  { slug: 'adr-012', title: 'ADR-012 SmartRetrieval', group: 'ADRs' },
  { slug: 'adr-013', title: 'ADR-013 Ed25519 Federation', group: 'ADRs' },
  { slug: 'adr-014', title: 'ADR-014 Knowledge Graph', group: 'ADRs' },
  { slug: 'adr-015', title: 'ADR-015 ADA API SQLite', group: 'ADRs' },
  { slug: 'adr-016', title: 'ADR-016 Control Plane Protocol', group: 'ADRs' },
  { slug: 'adr-017', title: 'ADR-017 PostgreSQL Schema', group: 'ADRs' },
  { slug: 'adr-018', title: 'ADR-018 Memory Recall Asservi', group: 'ADRs' },
  { slug: 'adr-019', title: 'ADR-019 Bench v2 Ablation', group: 'ADRs' },

  // Releases
  { slug: 'release-730', title: 'v7.3.0 (Latest)', group: 'Releases' },
  { slug: 'release-720', title: 'v7.2.0', group: 'Releases' },
  { slug: 'release-710', title: 'v7.1.0', group: 'Releases' },
  { slug: 'release-700', title: 'v7.0.0', group: 'Releases' },
]
