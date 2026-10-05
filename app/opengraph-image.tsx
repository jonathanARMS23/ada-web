import { ImageResponse } from 'next/og'

export const alt = 'ADA — AI Engineering OS by ByARMS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 96,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #151530 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 160, fontWeight: 800, letterSpacing: -4 }}>ADA</div>
        <div style={{ fontSize: 48, marginTop: 16, color: '#c7c7e0' }}>AI Engineering OS by ByARMS</div>
        <div style={{ fontSize: 30, marginTop: 40, color: '#8d8db0' }}>
          Claude Code + Codex · mémoire · contrôle · observabilité
        </div>
      </div>
    ),
    { ...size },
  )
}
