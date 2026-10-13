import React, { useState } from 'react';
import {
  Settings, Server, Database, Zap, Check, Copy,
  ExternalLink, RefreshCw, Shield, Bell, Monitor, Sliders
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useToast } from '../context/ToastContext';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <p className="card-title"><Icon size={16} /> {title}</p>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 20, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div>
        <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</p>
        {description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ value, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      style={{
        width: 42, height: 24, borderRadius: 12,
        background: value ? 'var(--accent-primary)' : 'var(--bg-muted)',
        position: 'relative', transition: 'background 0.2s', border: 'none', cursor: 'pointer'
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { backendStatus, refreshBackendStatus } = useDataset();
  const { showToast } = useToast();

  const [apiUrl, setApiUrl] = useState(backendStatus.url || 'http://localhost:8000/api');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Feature toggles
  const [autoProfile, setAutoProfile] = useState(true);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
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
    showToast(`API URL updated to ${apiUrl}`, 'success');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Platform Settings & Configuration</h1>
        <p className="page-description">Manage backend connections, data preferences, and UI configuration.</p>
      </div>

      {/* Backend Connection */}
      <Section title="FastAPI Backend Gateway" icon={Server}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', borderRadius: 10, background: backendStatus.connected ? 'var(--success-subtle)' : 'var(--accent-subtle)', border: `1px solid ${backendStatus.connected ? 'var(--success-border)' : 'var(--accent-border)'}` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: backendStatus.connected ? 'var(--success)' : 'var(--warning)', animation: 'pulse 2s infinite' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: backendStatus.connected ? 'var(--success-text)' : 'var(--accent-primary)' }}>
              {backendStatus.connected ? 'FastAPI Backend Connected' : 'Demo Mode — Client-Side Engine Active'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {backendStatus.connected ? `Connected to ${backendStatus.url}` : 'Connect a Python FastAPI backend for advanced ML analytics'}
            </p>
          </div>
          {backendStatus.connected && <Zap size={16} style={{ color: 'var(--success)' }} />}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            type="text"
            className="input-field"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000/api"
            id="api-url-input"
            style={{ flex: 1 }}
          />
          <button className="btn-icon" onClick={copyApiUrl} title="Copy URL">
            {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleCheckConnection} disabled={checking} id="test-connection-btn">
            {checking ? <RefreshCw size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Server size={15} />}
            {checking ? 'Testing…' : 'Test Connection'}
          </button>
          <button className="btn btn-secondary" onClick={handleSaveUrl} id="save-api-url-btn">
            <Check size={15} /> Save URL
          </button>
          <a
            href="https://fastapi.tiangolo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={14} /> FastAPI Docs
          </a>
        </div>

        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Setting up a FastAPI backend:</p>
          <p>1. Install: <code style={{ background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>pip install fastapi uvicorn pandas</code></p>
          <p>2. Expose endpoints: <code style={{ background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>/health</code> and <code style={{ background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>/analyze/chat</code></p>
          <p>3. Start: <code style={{ background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 4 }}>uvicorn main:app --reload --port 8000</code></p>
        </div>
      </Section>

      {/* Data Preferences */}
      <Section title="Data & Analysis Preferences" icon={Database}>
        <SettingRow label="Auto-profile on upload" description="Automatically compute statistics when a new file is loaded">
          <Toggle value={autoProfile} onChange={setAutoProfile} id="toggle-auto-profile" />
        </SettingRow>
        <SettingRow label="Save analysis history" description="Persist query history across browser sessions">
          <Toggle value={historyEnabled} onChange={setHistoryEnabled} id="toggle-history" />
        </SettingRow>
        <SettingRow label="Max rows analyzed" description="Limit for client-side analysis to maintain performance">
          <select className="input-field" style={{ width: 120 }} id="max-rows-select">
            <option>500</option>
            <option selected>1,000</option>
            <option>5,000</option>
            <option>All</option>
          </select>
        </SettingRow>
      </Section>

      {/* UI Preferences */}
      <Section title="Interface Preferences" icon={Monitor}>
        <SettingRow label="Dark mode" description="Switch to a dark color scheme (coming soon)">
          <Toggle value={darkMode} onChange={v => { setDarkMode(v); showToast('Dark mode coming soon!', 'info'); }} id="toggle-dark-mode" />
        </SettingRow>
        <SettingRow label="Compact layout" description="Reduce spacing for higher information density">
          <Toggle value={compactMode} onChange={setCompactMode} id="toggle-compact" />
        </SettingRow>
        <SettingRow label="Chart animations" description="Smooth transitions when rendering data visualizations">
          <Toggle value={chartAnimations} onChange={setChartAnimations} id="toggle-animations" />
        </SettingRow>
        <SettingRow label="Notifications" description="Show toast notifications for actions and events">
          <Toggle value={notifications} onChange={setNotifications} id="toggle-notifications" />
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="About DataDetective" icon={Shield}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Engine', value: 'React + Vite' },
            { label: 'Charts', value: 'Recharts 3' },
            { label: 'Analysis', value: 'Client-Side + FastAPI' },
            { label: 'License', value: 'MIT' },
            { label: 'Storage', value: 'LocalStorage' }
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
