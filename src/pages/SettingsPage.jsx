import React, { useState } from 'react';
import {
  Server, Database, Check, Copy,
  ExternalLink, RefreshCw, Shield, Monitor, Zap
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useToast } from '../context/ToastContext';

/* ── Section wrapper ── */
function Section({ title, icon: Icon, description, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <div>
          <p className="card-title"><Icon size={13} /> {title}</p>
          {description && (
            <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{description}</p>
          )}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ── Setting row ── */
function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 20, padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div>
        <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>{label}</p>
        {description && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ value, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        width: 38, height: 22, borderRadius: 11,
        background: value ? 'var(--accent-primary)' : 'var(--bg-muted)',
        position: 'relative', transition: 'background var(--transition-base)',
        border: 'none', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 19 : 3,
        transition: 'left var(--transition-base)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { backendStatus, refreshBackendStatus } = useDataset();
  const { showToast } = useToast();

  const [apiUrl,  setApiUrl]  = useState(backendStatus.url || 'http://localhost:8000/api');
  const [checking, setChecking] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const [autoProfile,     setAutoProfile]     = useState(true);
  const [historyEnabled,  setHistoryEnabled]  = useState(true);
  const [notifications,   setNotifications]   = useState(true);
  const [darkMode,        setDarkMode]        = useState(false);
  const [compactMode,     setCompactMode]     = useState(false);
  const [chartAnimations, setChartAnimations] = useState(true);

  const handleCheckConnection = async () => {
    setChecking(true);
    await refreshBackendStatus();
    setChecking(false);
    if (backendStatus.connected) {
      showToast('FastAPI backend connected successfully!', 'success');
    } else {
      showToast('No FastAPI backend detected. Running in Demo Mode.', 'info');
    }
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    showToast(`API URL saved: ${apiUrl}`, 'success');
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Backend connections, data preferences, and interface configuration.</p>
      </div>

      {/* ── FastAPI connection ── */}
      <Section title="FastAPI Backend Gateway" icon={Server} description="Connect a Python backend for advanced ML analytics">
        {/* Status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          background: backendStatus.connected ? 'var(--sage-subtle)' : 'var(--bg-inset)',
          border: `1px solid ${backendStatus.connected ? 'var(--sage-border)' : 'var(--border-default)'}`,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: backendStatus.connected ? 'var(--sage)' : 'var(--warning)',
            animation: 'pulse 2s infinite',
          }} />
          <div style={{ flex: 1 }}>
            <p style={{
              fontWeight: 600, fontSize: 13,
              color: backendStatus.connected ? 'var(--sage-text)' : 'var(--text-secondary)',
            }}>
              {backendStatus.connected ? 'Backend connected' : 'Demo mode — client-side engine active'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
              {backendStatus.connected
                ? `Connected to ${backendStatus.url}`
                : 'Connect a Python FastAPI backend for real ML inference'}
            </p>
          </div>
          {backendStatus.connected && <Zap size={14} style={{ color: 'var(--sage)' }} />}
        </div>

        {/* URL input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            className="input-field"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000/api"
            id="api-url-input"
            style={{ flex: 1 }}
          />
          <button className="btn-icon" onClick={copyApiUrl} title="Copy URL" style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 8px' }}>
            {copied
              ? <Check size={14} style={{ color: 'var(--sage)' }} />
              : <Copy size={14} />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleCheckConnection} disabled={checking} id="test-connection-btn">
            {checking
              ? <RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
              : <Server size={13} />}
            {checking ? 'Testing…' : 'Test Connection'}
          </button>
          <button className="btn btn-secondary" onClick={handleSaveUrl} id="save-api-url-btn">
            <Check size={13} /> Save URL
          </button>
          <a
            href="https://fastapi.tiangolo.com"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={12} /> FastAPI Docs
          </a>
        </div>

        {/* Setup guide */}
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)',
          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.75,
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Quick setup:</p>
          <p>1. Install: <code style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>pip install fastapi uvicorn pandas</code></p>
          <p>2. Expose: <code style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/health</code> and <code style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/analyze/chat</code></p>
          <p>3. Start: <code style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>uvicorn main:app --reload --port 8000</code></p>
        </div>
      </Section>

      {/* ── Data preferences ── */}
      <Section title="Data & Analysis" icon={Database}>
        <SettingRow label="Auto-profile on upload" description="Compute statistics automatically when a new file is loaded">
          <Toggle value={autoProfile} onChange={setAutoProfile} id="toggle-auto-profile" />
        </SettingRow>
        <SettingRow label="Save analysis history" description="Persist query history across browser sessions">
          <Toggle value={historyEnabled} onChange={setHistoryEnabled} id="toggle-history" />
        </SettingRow>
        <SettingRow label="Max rows analyzed" description="Limit for client-side analysis">
          <select className="input-field select-field" style={{ width: 110 }} id="max-rows-select">
            <option>500</option>
            <option>1,000</option>
            <option>5,000</option>
            <option>All</option>
          </select>
        </SettingRow>
      </Section>

      {/* ── Interface preferences ── */}
      <Section title="Interface" icon={Monitor}>
        <SettingRow label="Dark mode" description="Switch to a dark color scheme (coming soon)">
          <Toggle value={darkMode} onChange={v => { setDarkMode(v); showToast('Dark mode coming soon!', 'info'); }} id="toggle-dark-mode" />
        </SettingRow>
        <SettingRow label="Compact layout" description="Reduce spacing for higher information density">
          <Toggle value={compactMode} onChange={setCompactMode} id="toggle-compact" />
        </SettingRow>
        <SettingRow label="Chart animations" description="Smooth transitions when rendering visualizations">
          <Toggle value={chartAnimations} onChange={setChartAnimations} id="toggle-animations" />
        </SettingRow>
        <SettingRow label="Toast notifications" description="Show status notifications for actions">
          <Toggle value={notifications} onChange={setNotifications} id="toggle-notifications" />
        </SettingRow>
      </Section>

      {/* ── About ── */}
      <Section title="About DataDetective" icon={Shield}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            ['Version',  '1.0.0'],
            ['Engine',   'React + Vite'],
            ['Charts',   'Recharts 3'],
            ['Analysis', 'Client + FastAPI'],
            ['License',  'MIT'],
            ['Storage',  'LocalStorage'],
          ].map(([label, value], i) => (
            <div key={i} style={{
              padding: '10px 12px',
              background: 'var(--bg-inset)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  );
}
