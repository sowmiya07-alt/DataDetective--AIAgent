import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Database, ChevronDown, Check, Server, Zap,
  Bell, Menu, User
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const ROUTE_META = {
  '/':        { eyebrow: 'Overview',   title: 'Dashboard' },
  '/analyze': { eyebrow: 'Data',       title: 'Dataset Analysis' },
  '/ask':     { eyebrow: 'AI',         title: 'Ask Your Data' },
  '/reports': { eyebrow: 'Analytics',  title: 'Reports & Insights' },
  '/history': { eyebrow: 'Audit',      title: 'Analysis History' },
  '/settings':{ eyebrow: 'Config',     title: 'Settings' },
};

export function Navbar({ onOpenMobile }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { datasets, activeDataset, selectDataset, backendStatus } = useDataset();

  const [dsOpen,  setDsOpen]  = useState(false);
  const [profOpen,setProfOpen] = useState(false);

  const meta = ROUTE_META[location.pathname] || { eyebrow: 'DataDetective', title: 'Workspace' };

  const close = () => { setDsOpen(false); setProfOpen(false); };

  return (
    <header className="top-navbar" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>

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
          <Menu size={18} />
        </button>

        <div>
          <p className="page-eyebrow">{meta.eyebrow}</p>
          <p className="page-heading">{meta.title}</p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="navbar-right">

        {/* Dataset selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setDsOpen(!dsOpen); setProfOpen(false); }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, maxWidth: 220 }}
            id="dataset-selector-btn"
          >
            <Database size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, fontWeight: 500 }}>
              {activeDataset ? activeDataset.name : 'Select dataset'}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          </button>

          {dsOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setDsOpen(false)} />
              <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 6px)', width: 280, zIndex: 60 }}>
                <div className="dropdown-label">Available Datasets</div>
                {datasets.map(d => {
                  const active = d.id === activeDataset?.id;
                  return (
                    <button
                      key={d.id}
                      className="dropdown-item"
                      onClick={() => { selectDataset(d.id); setDsOpen(false); }}
                      style={{ fontWeight: active ? 600 : 400, color: active ? 'var(--accent-primary)' : undefined }}
                    >
                      <Database size={13} style={{ color: active ? 'var(--accent-primary)' : 'var(--text-faint)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                          {d.isDemo ? 'Demo data' : 'Uploaded'} · {d.rowCount?.toLocaleString()} rows
                        </div>
                      </div>
                      {active && <Check size={13} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })}
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { navigate('/analyze'); setDsOpen(false); }}>
                  <Database size={13} />
                  Upload new dataset…
                </button>
              </div>
            </>
          )}
        </div>

        {/* Backend status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px',
          borderRadius: 'var(--radius-full)',
          background: backendStatus.connected ? 'var(--sage-subtle)' : 'var(--bg-inset)',
          border: `1px solid ${backendStatus.connected ? 'var(--sage-border)' : 'var(--border-default)'}`,
          fontSize: 11, fontWeight: 600,
          color: backendStatus.connected ? 'var(--sage-text)' : 'var(--text-muted)',
          cursor: 'default',
          whiteSpace: 'nowrap',
        }}
          title={backendStatus.connected ? `Connected: ${backendStatus.url}` : 'Demo mode — local analysis engine'}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: backendStatus.connected ? 'var(--sage)' : 'var(--text-faint)',
            animation: backendStatus.connected ? 'pulse 2s infinite' : 'none',
          }} />
          {backendStatus.connected ? 'Connected' : 'Demo mode'}
        </div>

        {/* User */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setProfOpen(!profOpen); setDsOpen(false); }}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--bg-inset)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
            aria-label="User menu"
            id="user-menu-btn"
          >
            <User size={14} />
          </button>

          {profOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setProfOpen(false)} />
              <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 6px)', width: 200, zIndex: 60 }}>
                <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>Data Analyst</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>analyst@datadetective.ai</p>
                </div>
                <button className="dropdown-item" onClick={() => { navigate('/settings'); setProfOpen(false); }}>
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </header>
  );
}
