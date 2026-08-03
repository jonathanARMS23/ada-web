/**
 * Tue le(s) processus qui écoutent sur les ports donnés.
 * Utilitaire de test : `next start` lancé via npx laisse un petit-fils orphelin
 * si l'on ne tue que le wrapper.
 *
 * Usage : node scripts/kill-port.mjs 3097 3098 3099
 */
import { execFileSync } from 'node:child_process'

const ports = process.argv.slice(2)
if (ports.length === 0) {
  console.error('Usage : node scripts/kill-port.mjs <port> [port…]')
  process.exit(1)
}

for (const port of ports) {
  let pids = []
  try {
    pids = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
    })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  } catch {
    // lsof sort en code 1 quand rien n'écoute
  }

  if (pids.length === 0) {
    console.log(`port ${port} : libre`)
    continue
  }

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL')
      console.log(`port ${port} : PID ${pid} tué`)
    } catch (err) {
      console.log(`port ${port} : échec sur PID ${pid} (${err.code})`)
    }
  }
}
