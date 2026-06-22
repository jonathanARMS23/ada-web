'use client'
import { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' mobile-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div id="sidebar" className={sidebarOpen ? 'mobile-open' : ''}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — uses CSS IDs from globals.css */}
      <div id="main-wrap">
        <div id="content">
          {children}
        </div>
      </div>
    </div>
  )
}
