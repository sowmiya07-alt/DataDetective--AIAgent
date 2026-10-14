import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Database, TrendingUp, AlertTriangle, CheckCircle,
  Upload, ArrowRight, Clock, FileText, Hash, Type,
  Layers, Activity
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { formatNumber } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#C05C3F', '#507558', '#3D6095', '#92650A', '#7A5476', '#78716C'];

const TT = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E2DDD6',
    borderRadius: 6,
    fontSize: 11,
    color: '#1C1917',
    boxShadow: '0 4px 8px rgba(28,25,23,0.07)',
    padding: '6px 10px',
  },
  cursor: { stroke: '#E2DDD6' },
};

export default function DashboardPage() {
  const { activeDataset, datasets, history } = useDataset();
  const navigate = useNavigate();

  const data    = activeDataset?.data || [];
  const cols    = activeDataset?.columns || [];
  const numCols = cols.filter(c => c.type === 'number');
  const catCols = cols.filter(c => c.type === 'string');
  const primNum = numCols[0];
  const primCat = catCols[0];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  /* Area chart: first 30 records */
  const areaData = useMemo(() => {
    if (!primNum || !data.length) return [];
    return data.slice(0, 30).map((r, i) => ({
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
      .map(([cat, { s, n }]) => ({
        cat: cat.length > 12 ? cat.slice(0, 11) + '…' : cat,
        avg: +(s / n).toFixed(1),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 7);
  }, [primCat, primNum, data]);

  /* Pie: category distribution */
  const pieData = useMemo(() => {
    if (!primCat || !data.length) return [];
    const d = {};
    data.forEach(r => {
      const k = String(r[primCat.name] || 'Other');
      d[k] = (d[k] || 0) + 1;
    });
    return Object.entries(d)
      .map(([name, v]) => ({ name, v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 6);
  }, [primCat, data]);

  const health       = activeDataset?.summary?.healthScore   || 0;
  const missing      = activeDataset?.summary?.totalMissingCells || 0;
  const recentHistory = (history || []).slice(0, 5);
  const hasDataset   = !!activeDataset;

  /* Health color */
  const healthColor = health >= 90 ? 'var(--sage)'
    : health >= 70 ? 'var(--warning)'
    : 'var(--danger)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: 28, alignItems: 'start' }}>

      {/* ═══════════════════════════ LEFT — Main ═══════════════════════════ */}
      <div>

        {/* ── Welcome strip ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 500, marginBottom: 2 }}>{today}</p>
          <h1 style={{
            fontSize: 22, fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em', lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {hasDataset ? `Exploring ${activeDataset.name}` : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {hasDataset
              ? `${formatNumber(activeDataset.rowCount)} records · ${activeDataset.columnCount} columns — ready to analyze`
              : 'Upload a dataset or select a demo to start your analysis.'}
          </p>
        </div>

        {hasDataset ? (
          <>
            {/* ── Dataset ribbon (replaces 4 stat cards) ── */}
            <div className="dataset-ribbon" style={{ marginBottom: 24 }}>
              <div className="ribbon-cell">
                <p className="ribbon-label">Records</p>
                <p className="ribbon-value">{formatNumber(activeDataset.rowCount)}</p>
              </div>
              <div className="ribbon-cell">
                <p className="ribbon-label">Columns</p>
                <p className="ribbon-value">{activeDataset.columnCount}</p>
              </div>
              <div className="ribbon-cell">
                <p className="ribbon-label">Data Health</p>
                <p className="ribbon-value" style={{ color: healthColor }}>{health}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-faint)' }}>/100</span></p>
              </div>
              <div className="ribbon-cell">
                <p className="ribbon-label">Missing Values</p>
                <p className="ribbon-value" style={{ color: missing === 0 ? 'var(--sage)' : missing > 100 ? 'var(--warning)' : 'var(--text-primary)' }}>
                  {missing === 0 ? 'None' : formatNumber(missing)}
                </p>
              </div>
              <div className="ribbon-cell" style={{ borderRight: 'none' }}>
                <p className="ribbon-label">Type</p>
                <p className="ribbon-value" style={{ fontSize: 13 }}>
                  {activeDataset.isDemo
                    ? <span style={{ color: 'var(--warning)' }}>Demo</span>
                    : <span style={{ color: 'var(--sage)' }}>Live</span>
                  }
                </p>
              </div>
            </div>

            {/* ── Primary chart — area ── */}
            {areaData.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline',
                  justifyContent: 'space-between', marginBottom: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {primNum?.name}
                      <span style={{ fontWeight: 400, color: 'var(--text-faint)', marginLeft: 6 }}>— sample trend</span>
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                      First 30 records{primCat ? ` · grouped by ${primCat.name}` : ''}
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigate('/ask')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Explore <ArrowRight size={11} />
                  </button>
                </div>

                <div style={{
                  height: 188,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 14px 10px',
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#C05C3F" stopOpacity={0.10} />
                          <stop offset="100%" stopColor="#C05C3F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E2" vertical={false} />
                      <XAxis dataKey="i" tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={42} />
                      <Tooltip {...TT} />
                      <Area
                        type="monotone" dataKey="value"
                        stroke="#C05C3F" strokeWidth={1.5}
                        fill="url(#areaFill)" dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Two-chart row ── */}
            {(barData.length > 0 || pieData.length > 0) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: pieData.length > 0 ? '1fr 200px' : '1fr',
                gap: 16,
                marginBottom: 24,
              }}>
                {barData.length > 0 && (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 14px 10px',
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      Avg {primNum?.name} by {primCat?.name}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 12 }}>Top groups ranked by average</p>
                    <div style={{ height: 150 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E2" vertical={false} />
                          <XAxis dataKey="cat" tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={38} />
                          <Tooltip {...TT} />
                          <Bar dataKey="avg" fill="#C05C3F" radius={[2, 2, 0, 0]} name={`Avg ${primNum?.name}`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {pieData.length > 0 && (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{primCat?.name}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>Distribution</p>
                    <div style={{ height: 150 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData} dataKey="v" nameKey="name"
                            cx="50%" cy="50%"
                            outerRadius={64} innerRadius={28}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...TT} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Column quick-profile ── */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10,
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Column Profile</p>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate('/analyze')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Full analysis <ArrowRight size={11} />
                </button>
              </div>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
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
                      const fillCls = pct >= 95 ? 'progress-fill-success'
                        : pct >= 80 ? 'progress-fill-warning'
                        : 'progress-fill-danger';
                      return (
                        <tr key={col.name}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{col.name}</td>
                          <td>
                            <span className={`badge ${col.type === 'number' ? 'badge-primary' : col.type === 'date' ? 'badge-info' : 'badge-default'}`}>
                              {col.type}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div className="progress-track" style={{ flex: 1 }}>
                                <div className={`progress-fill ${fillCls}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 10, color: 'var(--text-faint)', minWidth: 26, textAlign: 'right', fontFeatureSettings: '"tnum"' }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontFeatureSettings: '"tnum"' }}>
                            {col.uniqueCount ?? '—'}
                          </td>
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '52px 36px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: 'var(--bg-inset)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Database size={20} style={{ color: 'var(--text-faint)' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No dataset loaded</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.65 }}>
                Upload a CSV, XLSX, or JSON file — or explore one of the three demo datasets available in the sidebar.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
              <Upload size={13} /> Upload Dataset
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════ RIGHT — Sidebar ═══════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Quick actions */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '11px 14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
              Quick Actions
            </p>
          </div>
          <div style={{ padding: '6px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { label: 'Ask a question',    sub: 'Natural language queries', path: '/ask',     icon: '⌨' },
              { label: 'Upload dataset',    sub: 'CSV, XLSX, or JSON',      path: '/analyze',  icon: '↑' },
              { label: 'Generate report',   sub: 'Executive insights',      path: '/reports',  icon: '⊞' },
            ].map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 9px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left', width: '100%',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-inset)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-inset)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, flexShrink: 0, color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}>
                  {a.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.sub}</p>
                </div>
                <ArrowRight size={11} style={{ color: 'var(--text-faint)', flexShrink: 0, marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Datasets list */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '11px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Datasets</p>
            <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFeatureSettings: '"tnum"' }}>
              {datasets.length} loaded
            </span>
          </div>
          <div style={{ padding: '6px' }}>
            {datasets.length === 0 ? (
              <p style={{ padding: '12px 8px', fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
                No datasets yet
              </p>
            ) : (
              datasets.slice(0, 5).map(ds => {
                const isActive = ds.id === activeDataset?.id;
                return (
                  <div
                    key={ds.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 8px', borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--accent-subtle)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    {isActive && (
                      <span style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'var(--accent-primary)', flexShrink: 0,
                      }} />
                    )}
                    {!isActive && (
                      <span style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'transparent', flexShrink: 0,
                      }} />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ds.name}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>
                        {ds.isDemo ? 'Demo' : 'Uploaded'} · {formatNumber(ds.rowCount)} rows
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent queries */}
        {recentHistory.length > 0 && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '11px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Queries</p>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/history')}>
                All
              </button>
            </div>
            <div style={{ padding: '6px' }}>
              {recentHistory.map((h, i) => (
                <button
                  key={h.id || i}
                  onClick={() => navigate('/ask', { state: { prefillQuery: h.question } })}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 8px', borderRadius: 'var(--radius-sm)',
                    borderBottom: i < recentHistory.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-inset)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <p style={{
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>
                    {h.question}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={9} style={{ color: 'var(--text-faint)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                      {h.timestamp
                        ? new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No queries empty state */}
        {recentHistory.length === 0 && hasDataset && (
          <div style={{
            padding: '16px 14px',
            background: 'var(--bg-inset)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No recent queries. Head to{' '}
              <button
                onClick={() => navigate('/ask')}
                style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Ask AI
              </button>{' '}
              to start interrogating your data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
