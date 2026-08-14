'use client'
import { createPortal } from 'react-dom'
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

  // Focus à l'ouverture (le composant n'est monté que lorsque la modale est ouverte,
  // donc uniquement suite à une interaction client — `document` est déjà disponible).
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

  const busy = status === 'loading' || status === 'success'

  // Garde défensive : `document` n'existe que côté client, or ce composant n'est
  // jamais monté pendant le rendu serveur (uniquement après un clic utilisateur).
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        animation: 'dl-overlay-in .2s ease both',
        padding: '32px 16px',
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[440px] max-h-[calc(100vh-4rem)] overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
        style={{
          boxShadow:
            '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,.12), 0 0 60px rgba(124,58,237,.10)',
          animation: 'dl-modal-in .32s cubic-bezier(0.16,1,0.3,1) both',
          margin: 'auto',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3.5 border-b border-[var(--border)]"
          style={{ padding: '20px 24px' }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(124,58,237,0.12)',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}
          >
            <svg
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              className="text-[var(--primary)]"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
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
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--text-m)] hover:text-[var(--text)] hover:bg-[var(--surface-el)] transition-colors"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex flex-col gap-4" style={{ padding: '20px 24px' }}>
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
            disabled={busy}
            className="w-full bg-[var(--code-bg)] border border-[var(--border)] rounded-xl font-mono text-[16px] text-center tracking-[0.18em] text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.16)] placeholder:text-[var(--text-m)] placeholder:tracking-[0.12em] disabled:opacity-60"
            style={{ padding: '14px 16px' }}
          />

          {status === 'error' && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 text-[12.5px] text-[var(--red)] bg-[rgba(239,68,68,0.09)] border border-[rgba(239,68,68,0.3)] rounded-xl"
              style={{ animation: 'dl-status-in .25s ease both', padding: '10px 12px' }}
            >
              <span
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.18)', marginTop: 1 }}
                aria-hidden="true"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {status === 'success' && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2.5 text-[12.5px] text-[var(--green)] bg-[rgba(16,185,129,0.09)] border border-[rgba(16,185,129,0.3)] rounded-xl"
              style={{ animation: 'dl-status-in .25s ease both', padding: '10px 12px' }}
            >
              <span
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.18)', marginTop: 1 }}
                aria-hidden="true"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="leading-relaxed">Code validé — le téléchargement va démarrer.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={code.trim().length === 0 || busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white text-[14px] font-semibold transition-[background-color,box-shadow,transform] shadow-[0_0_24px_rgba(124,58,237,0.4)] hover:bg-[#6D28D9] hover:shadow-[0_0_38px_rgba(124,58,237,0.6)] hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none disabled:translate-y-0"
            style={{ padding: '12px 16px' }}
          >
            {status === 'loading' && (
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {status === 'loading' ? 'Vérification…' : 'Débloquer le téléchargement'}
          </button>

          <p className="m-0 text-[11.5px] text-[var(--text-m)]">
            Chaque code ne fonctionne qu&apos;une seule fois.
          </p>
        </form>
      </div>
    </div>,
    document.body,
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
