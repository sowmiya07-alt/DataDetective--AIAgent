import React, { useState } from 'react';
import {
  History, Trash2, Clock, Database, Zap, Search,
  Filter, ChevronRight, AlertCircle, Download
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
  'Data Quality & Outliers': { bg: 'var(--warning-subtle)', color: 'var(--warning-text)', border: 'var(--warning-border)' },
  'Categorical Benchmarking': { bg: 'var(--accent-subtle)', color: 'var(--accent-primary)', border: 'var(--accent-border)' },
  'Temporal Trend Analysis': { bg: 'var(--info-subtle)', color: 'var(--info-text)', border: 'var(--info-border)' },
  'Exploratory Pattern Discovery': { bg: 'var(--success-subtle)', color: 'var(--success-text)', border: 'var(--success-border)' },
};

function HistoryRow({ item, onReplay }) {
  const colors = TYPE_COLORS[item.queryType] || TYPE_COLORS['Exploratory Pattern Discovery'];
  const ts = item.timestamp ? new Date(item.timestamp).toLocaleString() : '—';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background 0.15s'
    }}
      className="history-row"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.question}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`
          }}>
            {item.queryType || 'Analysis'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Database size={11} /> {item.datasetName || '—'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {ts}
          </span>
          {item.executionTimeMs && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> {item.executionTimeMs}ms
            </span>
          )}
        </div>
      </div>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onReplay(item.question)}
        title="Re-run this query"
      >
        <ChevronRight size={14} /> Replay
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const { history, clearHistory } = useDataset();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const queryTypes = ['All', ...Array.from(new Set(history.map(h => h.queryType).filter(Boolean)))];

  const filtered = history.filter(h => {
    const matchSearch = !search || h.question?.toLowerCase().includes(search.toLowerCase()) || h.datasetName?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || h.queryType === filterType;
    return matchSearch && matchType;
  });

  const handleReplay = (question) => {
    navigate('/ask', { state: { prefillQuery: question } });
  };

  const handleExport = () => {
    const rows = history.map(h => ({
      Question: h.question,
      Dataset: h.datasetName,
      QueryType: h.queryType,
      ExecutionMs: h.executionTimeMs,
      Timestamp: h.timestamp,
      Mode: h.mode
    }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'DataDetective_History.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header" style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Audit Log & Analysis History</h1>
          <p className="page-description">Full chronological record of all AI queries and analysis sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {history.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={handleExport} id="export-history-btn">
                <Download size={15} /> Export
              </button>
              <button className="btn btn-danger btn-sm" onClick={clearHistory} id="clear-history-btn">
                <Trash2 size={14} /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Queries', value: history.length, color: '#4f46e5' },
          { label: 'Unique Datasets', value: new Set(history.map(h => h.datasetName)).size, color: '#06b6d4' },
          { label: 'Avg Response Time', value: history.length ? `${Math.round(history.reduce((a, h) => a + (h.executionTimeMs || 0), 0) / history.length)}ms` : '—', color: '#10b981' },
          { label: 'Query Types', value: queryTypes.length - 1, color: '#f59e0b' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} />
            <input
              type="text"
              className="input-field"
              placeholder="Search questions or datasets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="history-search"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            {queryTypes.map(t => (
              <button
                key={t}
                className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterType(t)}
                style={{ fontSize: '0.75rem' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No history found</p>
            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Start asking questions on the "Ask Your Data" page</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/ask')}>
              Go Ask Your Data <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((item, i) => (
              <HistoryRow key={item.id || i} item={item} onReplay={handleReplay} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {history.length} records
          </div>
        )}
      </div>

      <style>{`.history-row:hover { background: var(--bg-subtle); }`}</style>
    </div>
  );
}
