import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Database, TrendingUp, AlertTriangle, CheckCircle,
  Upload, ArrowRight, Clock, FileText, Hash, Type
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { formatNumber } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#C05C3F', '#587A5F', '#4A6FA5', '#9A6E0A', '#7C5C7A', '#78716C'];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E5E2DC',
    borderRadius: 7,
    fontSize: 12,
    color: '#1C1917',
    boxShadow: '0 4px 8px rgba(28,25,23,0.07)',
  },
};

export default function DashboardPage() {
  const { activeDataset, datasets, history } = useDataset();
  const navigate = useNavigate();

  const data     = activeDataset?.data || [];
  const cols     = activeDataset?.columns || [];
  const numCols  = cols.filter(c => c.type === 'number');
  const catCols  = cols.filter(c => c.type === 'string');
  const primNum  = numCols[0];
  const primCat  = catCols[0];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  /* Area chart: first 24 records */
  const areaData = useMemo(() => {
    if (!primNum || !data.length) return [];
    return data.slice(0, 24).map((r, i) => ({
      i: i + 1,
      value: parseFloat(r[primNum.name]) || 0,
    }));
  }, [primNum, data]);

  /* Bar: avg per category */
  const barData = useMemo(() => {
    if (!primCat || !primNum || !data.length) return [];
    const g = {};
    data.forEach(r => {
      const k = String(r[primCat.name] || 'Other');
      const v = parseFloat(r[primNum.name]) || 0;
      if (!g[k]) g[k] = { s: 0, n: 0 };
      g[k].s += v; g[k].n++;
    });
    return Object.entries(g)
      .map(([cat, { s, n }]) => ({ cat: cat.length > 13 ? cat.slice(0, 12) + '…' : cat, avg: +(s / n).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 7);
  }, [primCat, primNum, data]);

  /* Pie: category distribution */
  const pieData = useMemo(() => {
    if (!primCat || !data.length) return [];
    const d = {};
    data.forEach(r => { const k = String(r[primCat.name] || 'Other'); d[k] = (d[k] || 0) + 1; });
    return Object.entries(d).map(([name, v]) => ({ name, v })).sort((a, b) => b.v - a.v).slice(0, 6);
  }, [primCat, data]);

  const health       = activeDataset?.summary?.healthScore   || 0;
  const completeness = activeDataset?.summary?.completeness  || 0;
  const missing      = activeDataset?.summary?.totalMissingCells || 0;
  const recentHistory = (history || []).slice(0, 4);

  const hasDataset = !!activeDataset;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

      {/* ═══════════════════════════════════ LEFT MAIN ═══════════════════════════════════ */}
      <div>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500, marginBottom: 4 }}>{today}</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 6 }}>
            {hasDataset ? `Exploring ${activeDataset.name}` : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {hasDataset
              ? `${formatNumber(activeDataset.rowCount)} records · ${activeDataset.columnCount} columns · Health score ${health}/100`
              : 'Upload a dataset to begin your analysis. Demo datasets are available in the sidebar.'}
          </p>
        </div>

        {hasDataset ? (
          <>
            {/* ── Dataset vitals ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Records',     value: formatNumber(activeDataset.rowCount), icon: Database, accent: '#C05C3F' },
                { label: 'Columns',     value: activeDataset.columnCount, icon: Hash, accent: '#587A5F' },
                { label: 'Health',      value: `${health}/100`, icon: CheckCircle, accent: health >= 90 ? '#587A5F' : health >= 70 ? '#9A6E0A' : '#C05C3F' },
                { label: 'Missing',     value: formatNumber(missing), icon: AlertTriangle, accent: missing === 0 ? '#587A5F' : '#9A6E0A' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} style={{
                    padding: '14px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>{s.label}</p>
                      <Icon size={14} style={{ color: s.accent }} />
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
                  </div>
                );
              })}
            </div>

            {/* ── Primary visualization ── */}
            {areaData.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {primNum?.name} — Sample Distribution
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>First 24 records · {primCat ? `grouped by ${primCat.name}` : 'sequential'}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ask')} style={{ gap: 5 }}>
                    Explore <ArrowRight size={13} />
                  </button>
                </div>

                <div style={{ height: 200, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 16px 12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#C05C3F" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#C05C3F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                      <XAxis dataKey="i" tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="value" stroke="#C05C3F" strokeWidth={1.5} fill="url(#areaFill)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Two-chart row ── */}
            {(barData.length > 0 || pieData.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 220px' : '1fr', gap: 16, marginBottom: 28 }}>
                {barData.length > 0 && (
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 16px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                      Avg {primNum?.name} by {primCat?.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 14 }}>Top groups ranked</p>
                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                          <XAxis dataKey="cat" tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={44} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Bar dataKey="avg" fill="#C05C3F" radius={[3, 3, 0, 0]} name={`Avg ${primNum?.name}`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {pieData.length > 0 && (
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{primCat?.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 10 }}>Distribution</p>
                    <div style={{ height: 168 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={68} innerRadius={30}>
                            {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip {...TOOLTIP_STYLE} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Column quick-profile ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Column Profile</p>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analyze')}>
                  Full analysis <ArrowRight size={12} />
                </button>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table className="custom-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                      <th>Completeness</th>
                      <th>Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cols.slice(0, 7).map(col => {
                      const pct = activeDataset.rowCount
                        ? Math.round(((activeDataset.rowCount - col.nullCount) / activeDataset.rowCount) * 100)
                        : 100;
                      const fillCls = pct >= 95 ? 'progress-fill-success' : pct >= 80 ? 'progress-fill-warning' : 'progress-fill-danger';
                      return (
                        <tr key={col.name}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{col.name}</td>
                          <td>
                            <span className={`badge ${col.type === 'number' ? 'badge-primary' : col.type === 'date' ? 'badge-info' : 'badge-default'}`}>
                              {col.type}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress-track" style={{ flex: 1 }}>
                                <div className={`progress-fill ${fillCls}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-faint)', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{col.uniqueCount ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '56px 36px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={24} style={{ color: 'var(--text-faint)' }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No dataset loaded</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
                Upload a CSV, XLSX, or JSON file — or explore one of the three demo datasets available in the sidebar.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
              <Upload size={14} /> Upload Dataset
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════ RIGHT PANEL ═══════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Quick actions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Quick Actions</p>
          </div>
          <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Ask AI a question',   sub: 'Natural language queries', path: '/ask',     icon: '💬' },
              { label: 'Upload new dataset',  sub: 'CSV, XLSX, or JSON',      path: '/analyze',  icon: '📁' },
              { label: 'Generate report',     sub: 'Executive insights',      path: '/reports',  icon: '📊' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                borderRadius: 'var(--radius-sm)', textAlign: 'left', width: '100%',
                transition: 'background var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-inset)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.sub}</p>
                </div>
                <ArrowRight size={12} style={{ color: 'var(--text-faint)', flexShrink: 0, marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Datasets list */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Datasets</p>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{datasets.length} loaded</span>
          </div>
          <div style={{ padding: '8px' }}>
            {datasets.slice(0, 5).map(ds => {
              const isActive = ds.id === activeDataset?.id;
              return (
                <div key={ds.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}>
                  <FileText size={13} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-faint)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ds.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{ds.isDemo ? 'Demo' : 'Uploaded'} · {formatNumber(ds.rowCount)} rows</p>
                  </div>
                  {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent history */}
        {recentHistory.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Queries</p>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/history')}>View all</button>
            </div>
            <div style={{ padding: '8px' }}>
              {recentHistory.map((h, i) => (
                <div key={h.id || i} style={{ padding: '8px 8px', borderBottom: i < recentHistory.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {h.question}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={10} style={{ color: 'var(--text-faint)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                      {h.timestamp ? new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                    {h.executionTimeMs && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{h.executionTimeMs}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
