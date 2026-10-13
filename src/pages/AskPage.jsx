import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Send, Database, AlertCircle, ChevronRight, Clock, Loader } from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analysisService } from '../services/analysisService';
import { formatNumber } from '../utils/formatters';

const CHART_COLORS = ['#C05C3F', '#587A5F', '#4A6FA5', '#9A6E0A', '#7C5C7A', '#78716C'];

const TT = {
  contentStyle: {
    background: '#fff', border: '1px solid #E5E2DC',
    borderRadius: 7, fontSize: 12, color: '#1C1917',
    boxShadow: '0 4px 8px rgba(28,25,23,0.07)',
  },
};

const SUGGESTED = [
  'Which category has the highest average value?',
  'Show data quality and outlier analysis',
  'What are the key trends and patterns?',
  'Compare groups and rank by performance',
  'Are there any missing values or anomalies?',
];

/* ── Result Chart ── */
function ResultChart({ chart }) {
  if (!chart?.data?.length) return null;

  if (chart.type === 'pie') return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chart.data} dataKey={chart.dataKeys?.[0]?.key || 'count'} nameKey="name"
          cx="50%" cy="50%" outerRadius={92} innerRadius={42}>
          {chart.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip {...TT} />
        <Legend iconSize={9} wrapperStyle={{ fontSize: 11, color: '#78716C' }} />
      </PieChart>
    </ResponsiveContainer>
  );

  if (chart.type === 'area') return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chart.data}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C05C3F" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#C05C3F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
        <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip {...TT} />
        {chart.dataKeys?.map(dk => (
          <Area key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color || '#C05C3F'} strokeWidth={1.5} fill="url(#ag)" dot={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  if (chart.type === 'line') return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
        <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip {...TT} />
        {chart.dataKeys?.map(dk => (
          <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color || '#4A6FA5'} strokeWidth={1.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chart.data} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
        <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip {...TT} />
        {(chart.dataKeys || [{ key: chart.yKey, color: '#C05C3F' }]).map(dk => (
          <Bar key={dk.key} dataKey={dk.key} fill={dk.color || '#C05C3F'} radius={[3, 3, 0, 0]} name={dk.label} />
        ))}
        {chart.dataKeys?.length > 1 && <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Narrative text (renders **bold**) ── */
function Narrative({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
          : p
      )}
    </p>
  );
}

export default function AskPage() {
  const location = useLocation();
  const { activeDataset, addHistoryItem } = useDataset();

  const [input,   setInput]   = useState(location.state?.prefillQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(null); // index of selected result

  const inputRef  = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (results.length > 0) {
      setActive(results.length - 1);
      canvasRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [results.length]);

  async function handleAsk(question = input.trim()) {
    if (!question || loading) return;
    if (!activeDataset) { setError('Select a dataset first.'); return; }
    setError(''); setLoading(true); setInput('');
    try {
      const result = await analysisService.askQuestion(activeDataset, question);
      setResults(prev => [...prev, { question, result }]);
      addHistoryItem({
        id: result.id, question, datasetName: activeDataset.name,
        queryType: result.queryType, executionTimeMs: result.executionTimeMs,
        timestamp: result.timestamp, mode: result.sourceSummary?.mode || 'Client-Side',
      });
    } catch (e) {
      setError('Analysis failed: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const activeResult = active !== null ? results[active] : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, height: 'calc(100vh - var(--topbar-height) - 64px)', maxHeight: 'calc(100vh - 120px)' }}>

      {/* ═══════════════════ LEFT — Conversation Panel ═══════════════════ */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--border-default)',
        height: '100%', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '0 0 16px', flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 4 }}>
            Dataset
          </p>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeDataset?.name || 'No dataset selected'}
          </p>
          {activeDataset && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {formatNumber(activeDataset.rowCount)} rows · {activeDataset.columnCount} columns
            </p>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 16, flexShrink: 0 }} />

        {/* Conversation thread */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 16 }}>
          {results.length === 0 && !loading && (
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 10 }}>
                Try asking
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SUGGESTED.map((q, i) => (
                  <button key={i} onClick={() => handleAsk(q)}
                    style={{
                      textAlign: 'left', padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--text-secondary)',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface)',
                      lineHeight: 1.4, cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map(({ question, result }, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                textAlign: 'left', padding: '10px 10px',
                borderRadius: 'var(--radius-sm)',
                background: active === i ? 'var(--accent-subtle)' : 'transparent',
                border: `1px solid ${active === i ? 'var(--accent-border)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 500, color: active === i ? 'var(--accent-text)' : 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3 }}>
                {question}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{result.queryType}</span>
                <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{result.executionTimeMs}ms</span>
              </div>
            </button>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px', color: 'var(--text-muted)' }}>
              <Loader size={13} style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}>Analyzing…</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 12px', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8, marginRight: 16, flexShrink: 0 }}>
            <AlertCircle size={13} style={{ color: 'var(--danger)', marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--danger-text)', lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {/* Input */}
        <div style={{ paddingRight: 16, paddingTop: 12, flexShrink: 0 }}>
          <div style={{
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)', padding: '8px 10px',
            display: 'flex', alignItems: 'flex-end', gap: 8,
            transition: 'border-color var(--transition-fast)',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
              placeholder={`Ask about ${activeDataset?.name || 'your data'}…`}
              rows={2}
              id="ask-input"
              style={{
                flex: 1, resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 13, color: 'var(--text-primary)',
                lineHeight: 1.5, fontFamily: 'inherit',
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAsk()}
              disabled={!input.trim() || loading}
              id="ask-submit-btn"
              style={{ flexShrink: 0, alignSelf: 'flex-end' }}
            >
              <Send size={13} />
            </button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>Enter to submit · Shift+Enter for newline</p>
        </div>
      </div>

      {/* ═══════════════════ RIGHT — Analytics Canvas ═══════════════════ */}
      <div ref={canvasRef} style={{ overflowY: 'auto', paddingLeft: 32, paddingRight: 0 }}>
        {!activeResult ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', minHeight: 400, gap: 16, textAlign: 'center', color: 'var(--text-muted)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} style={{ color: 'var(--text-faint)' }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Analysis canvas</p>
              <p style={{ fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>Ask a question in the panel on the left and your results will appear here.</p>
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeUp 0.2s ease' }}>
            {/* Question + meta */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 6 }}>Question</p>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 10 }}>
                {activeResult.question}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{activeResult.result.queryType}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {activeResult.result.executionTimeMs}ms
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                  {activeResult.result.sourceSummary?.mode}
                </span>
                {activeResult.result.sourceSummary?.mode?.includes('Client') && (
                  <span className="badge badge-warning" style={{ fontSize: 10 }}>Demo analysis</span>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 24 }} />

            {/* KPIs */}
            {activeResult.result.kpis?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 12 }}>Key Metrics</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
                  {activeResult.result.kpis.map((kpi, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      background: 'var(--bg-surface)',
                      border: `1px solid ${kpi.status === 'success' ? 'var(--sage-border)' : kpi.status === 'warning' ? 'var(--warning-border)' : kpi.status === 'danger' ? 'var(--danger-border)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 5, lineHeight: 1.2 }}>{kpi.label}</p>
                      <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narrative */}
            {activeResult.result.narrative && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 12 }}>Analysis</p>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
                  <Narrative text={activeResult.result.narrative} />
                </div>
              </div>
            )}

            {/* Chart */}
            {activeResult.result.chart && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 12 }}>{activeResult.result.chart.title}</p>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 16px 12px' }}>
                  <ResultChart chart={activeResult.result.chart} />
                </div>
              </div>
            )}

            {/* Data preview */}
            {activeResult.result.tableData?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 12 }}>
                  Data Preview — {Math.min(activeResult.result.tableData.length, 8)} rows
                </p>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        {Object.keys(activeResult.result.tableData[0] || {}).slice(0, 7).map(k => <th key={k}>{k}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activeResult.result.tableData.slice(0, 8).map((row, ri) => (
                        <tr key={ri}>
                          {Object.values(row).slice(0, 7).map((v, ci) => (
                            <td key={ci}>{typeof v === 'number' ? formatNumber(v) : String(v ?? '—')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Follow-ups */}
            {activeResult.result.followUps?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 10 }}>Follow-up Questions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeResult.result.followUps.map((fq, i) => (
                    <button key={i} onClick={() => handleAsk(fq)} style={{
                      textAlign: 'left', padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface)',
                      fontSize: 13, color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: 8,
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                    >
                      <ChevronRight size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      {fq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}
