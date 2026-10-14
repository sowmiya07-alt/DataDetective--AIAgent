import React, { useState } from 'react';
import {
  Trash2, Clock, Database, Zap, Search,
  Filter, ChevronRight, AlertCircle, Download, History
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
  'Data Quality & Outliers':       { cls: 'badge-warning',  label: 'Quality' },
  'Categorical Benchmarking':      { cls: 'badge-primary',  label: 'Categorical' },
  'Temporal Trend Analysis':       { cls: 'badge-info',     label: 'Temporal' },
  'Exploratory Pattern Discovery': { cls: 'badge-success',  label: 'Exploratory' },
};

function HistoryRow({ item, onReplay }) {
  const meta = TYPE_META[item.queryType] || { cls: 'badge-default', label: item.queryType || 'Analysis' };
  const ts = item.timestamp ? new Date(item.timestamp).toLocaleString() : '—';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Question */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 500, fontSize: 13, marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: 'var(--text-primary)',
        }}>
          {item.question}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span className={`badge ${meta.cls}`}>{meta.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Database size={10} /> {item.datasetName || '—'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {ts}
          </span>
          {item.executionTimeMs && (
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3, fontFeatureSettings: '"tnum"' }}>
              <Zap size={10} /> {item.executionTimeMs}ms
            </span>
          )}
        </div>
      </div>

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onReplay(item.question)}
        title="Re-run this query"
      >
        Replay <ChevronRight size={12} />
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const { history, clearHistory } = useDataset();
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('All');

  const queryTypes = ['All', ...Array.from(new Set(history.map(h => h.queryType).filter(Boolean)))];

  const filtered = history.filter(h => {
    const matchSearch = !search
      || h.question?.toLowerCase().includes(search.toLowerCase())
      || h.datasetName?.toLowerCase().includes(search.toLowerCase());
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
      Mode: h.mode,
    }));
    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'DataDetective_History.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header" style={{
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <h1 className="page-title">Analysis History</h1>
          <p className="page-subtitle">
            Chronological record of all queries
            {history.length > 0 && ` · ${history.length} total`}
          </p>
        </div>
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handleExport} id="export-history-btn">
              <Download size={13} /> Export
            </button>
            <button className="btn btn-danger btn-sm" onClick={clearHistory} id="clear-history-btn">
              <Trash2 size={12} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── Summary strip (only if there's history) ── */}
      {history.length > 0 && (
        <div style={{
          display: 'flex', gap: 0, marginBottom: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          {[
            {
              label: 'Total Queries',
              value: history.length,
            },
            {
              label: 'Unique Datasets',
              value: new Set(history.map(h => h.datasetName)).size,
            },
            {
              label: 'Avg Response',
              value: history.length
                ? `${Math.round(history.reduce((a, h) => a + (h.executionTimeMs || 0), 0) / history.length)}ms`
                : '—',
            },
            {
              label: 'Query Types',
              value: queryTypes.length - 1,
            },
          ].map((s, i, arr) => (
            <div
              key={i}
              style={{
                flex: 1, padding: '12px 16px',
                borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 3 }}>
                {s.label}
              </p>
              <p style={{
                fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"',
              }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter bar + history list ── */}
      <div className="card">
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <Search size={13} />
            <input
              type="text"
              className="input-field"
              placeholder="Search questions or datasets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="history-search"
              style={{ paddingLeft: 30 }}
            />
          </div>
          {queryTypes.length > 1 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={12} style={{ color: 'var(--text-faint)' }} />
              {queryTypes.map(t => (
                <button
                  key={t}
                  className={`btn btn-xs ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* History list */}
        {filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 9, background: 'var(--bg-inset)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <History size={18} style={{ color: 'var(--text-faint)' }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search || filterType !== 'All' ? 'No matching queries' : 'No history yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              {search || filterType !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'Start asking questions on the Ask AI page.'}
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/ask')}
            >
              Go to Ask AI <ChevronRight size={12} />
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
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 11, color: 'var(--text-faint)',
            fontFeatureSettings: '"tnum"',
          }}>
            Showing {filtered.length} of {history.length} records
          </div>
        )}
      </div>
    </div>
  );
}
