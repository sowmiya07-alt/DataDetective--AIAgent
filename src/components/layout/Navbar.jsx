import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Database, ChevronDown, Check, Menu, User } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const ROUTE_META = {
  '/':         { eyebrow: 'Overview',   title: 'Dashboard' },
  '/analyze':  { eyebrow: 'Data',       title: 'Datasets' },
  '/ask':      { eyebrow: 'AI',         title: 'Ask Your Data' },
  '/reports':  { eyebrow: 'Analytics',  title: 'Reports & Insights' },
  '/history':  { eyebrow: 'Audit',      title: 'History' },
  '/settings': { eyebrow: 'Config',     title: 'Settings' },
};

export function Navbar({ onOpenMobile }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { datasets, activeDataset, selectDataset, backendStatus } = useDataset();

  const [dsOpen,   setDsOpen]   = useState(false);
  const [profOpen, setProfOpen] = useState(false);

  const meta = ROUTE_META[location.pathname] || { eyebrow: 'DataDetective', title: 'Workspace' };
  const close = () => { setDsOpen(false); setProfOpen(false); };

  return (
    <header className="top-navbar" onClick={e => { if (e.target === e.currentTarget) close(); }}>

      {/* ── Left ── */}
      <div className="navbar-left">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobile}
          className="btn-icon"
          id="mobile-menu-btn"
          aria-label="Open navigation"
          style={{ display: 'none' }}
        >
          <Menu size={17} />
        </button>

        <div>
          <p className="page-eyebrow">{meta.eyebrow}</p>
          <p className="page-heading">{meta.title}</p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="navbar-right">

        {/* Backend status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 'var(--radius-full)',
          background: backendStatus.connected ? 'var(--sage-subtle)' : 'var(--bg-inset)',
          border: `1px solid ${backendStatus.connected ? 'var(--sage-border)' : 'var(--border-default)'}`,
          fontSize: 11, fontWeight: 600,
          color: backendStatus.connected ? 'var(--sage-text)' : 'var(--text-faint)',
          cursor: 'default', whiteSpace: 'nowrap',
        }}
          title={backendStatus.connected
            ? `Connected: ${backendStatus.url}`
            : 'Demo mode — local analysis engine'}
        >
          <span style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: backendStatus.connected ? 'var(--sage)' : 'var(--text-faint)',
            animation: backendStatus.connected ? 'pulse 2s infinite' : 'none',
          }} />
          {backendStatus.connected ? 'Connected' : 'Demo'}
        </div>

        {/* Dataset selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setDsOpen(!dsOpen); setProfOpen(false); }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 5, maxWidth: 200 }}
            id="dataset-selector-btn"
          >
            <Database size={12} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', maxWidth: 130, fontWeight: 500,
            }}>
              {activeDataset ? activeDataset.name : 'Select dataset'}
            </span>
            <ChevronDown size={11} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          </button>

          {dsOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setDsOpen(false)} />
              <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 5px)', width: 270, zIndex: 60 }}>
                <div className="dropdown-label">Datasets</div>
                {datasets.map(d => {
                  const active = d.id === activeDataset?.id;
                  return (
                    <button
                      key={d.id}
                      className="dropdown-item"
                      onClick={() => { selectDataset(d.id); setDsOpen(false); }}
                      style={{ fontWeight: active ? 600 : 400, color: active ? 'var(--accent-primary)' : undefined }}
                    >
                      <Database size={12} style={{ color: active ? 'var(--accent-primary)' : 'var(--text-faint)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1, fontFeatureSettings: '"tnum"' }}>
                          {d.isDemo ? 'Demo' : 'Uploaded'} · {d.rowCount?.toLocaleString()} rows
                        </div>
                      </div>
                      {active && <Check size={12} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })}
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => { navigate('/analyze'); setDsOpen(false); }}
                >
                  <Database size={12} />
                  Upload new dataset…
                </button>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setProfOpen(!profOpen); setDsOpen(false); }}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'border-color var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            aria-label="User menu"
            id="user-menu-btn"
          >
            <User size={13} />
          </button>

          {profOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setProfOpen(false)} />
              <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 5px)', width: 190, zIndex: 60 }}>
                <div style={{ padding: '7px 9px 6px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 3 }}>
                  <p style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>Data Analyst</p>
                  <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>analyst@datadetective.ai</p>
                </div>
                <button
                  className="dropdown-item"
                  onClick={() => { navigate('/settings'); setProfOpen(false); }}
                >
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </header>
  );
}
