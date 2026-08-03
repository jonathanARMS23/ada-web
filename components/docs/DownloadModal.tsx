'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * DownloadGate — remplace les anciens liens `<a href="/ADA-v7.zip" download>`.
 *
 * Rend un bouton qui ouvre une pop-up demandant le code de téléchargement.
 * Le flux : POST /api/download/redeem → si ok, navigation vers
 * /api/download/file?token=… (le jeton est à usage unique et expire vite).
 *
 * Chaque instance gère son propre état : aucun state à remonter dans la page.
 */

type Status = 'idle' | 'loading' | 'error' | 'success'

function DownloadModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus à l'ouverture (le composant n'est monté que lorsque la modale est ouverte).
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading' || status === 'success') return

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/download/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data: { ok?: boolean; downloadToken?: string; error?: string } = await res
        .json()
        .catch(() => ({}))

      if (!res.ok || !data.ok || !data.downloadToken) {
        setStatus('error')
        setError(data.error || 'Code invalide ou déjà utilisé.')
        return
      }

      setStatus('success')
      // Navigation directe : le navigateur reçoit un Content-Disposition
      // attachment et déclenche le téléchargement sans quitter la page.
      window.location.href = `/api/download/file?token=${encodeURIComponent(data.downloadToken)}`
    } catch {
      setStatus('error')
      setError('Erreur réseau. Merci de réessayer.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-start justify-center pt-[18vh] px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[440px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="text-[var(--primary)] flex-shrink-0"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2
            id="download-modal-title"
            className="flex-1 m-0 text-[15px] font-semibold text-[var(--text)]"
          >
            Code de téléchargement requis
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-[var(--text-m)] hover:text-[var(--text)] transition-colors leading-none text-[18px]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-4">
          <p className="m-0 text-[13px] leading-relaxed text-[var(--text-s)]">
            Saisissez le code à usage unique qui vous a été transmis après votre commande.
          </p>

          <input
            ref={inputRef}
            value={code}
            onChange={e => {
              setCode(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[var(--code-bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 font-mono text-[14px] tracking-[0.08em] text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors placeholder-[var(--text-m)] disabled:opacity-60"
          />

          {status === 'error' && (
            <div
              role="alert"
              className="text-[12.5px] text-[var(--red)] bg-[rgba(239,68,68,0.09)] border border-[rgba(239,68,68,0.3)] rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          {status === 'success' && (
            <div
              role="status"
              className="text-[12.5px] text-[var(--green)] bg-[rgba(16,185,129,0.09)] border border-[rgba(16,185,129,0.3)] rounded-lg px-3 py-2"
            >
              Code validé — le téléchargement va démarrer.
            </div>
          )}

          <button
            type="submit"
            disabled={code.trim().length === 0 || status === 'loading' || status === 'success'}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Vérification…' : 'Débloquer le téléchargement'}
          </button>

          <p className="m-0 text-[11.5px] text-[var(--text-m)]">
            Chaque code ne fonctionne qu&apos;une seule fois.
          </p>
        </form>
      </div>
    </div>
  )
}

export function DownloadGate({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>
      {open && <DownloadModal onClose={() => setOpen(false)} />}
    </>
  )
}
