import React, { useState, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Upload, Database, X, CheckCircle, AlertTriangle, Info,
  ChevronDown, ChevronUp, Hash, Type, Calendar, Layers, Search,
  ArrowUpRight
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useToast } from '../context/ToastContext';
import { parseUploadedDataset as parseFile } from '../utils/fileParser';
import { formatNumber } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const TT = {
  contentStyle: {
    background: '#fff', border: '1px solid #E2DDD6',
    borderRadius: 6, fontSize: 11, color: '#1C1917',
    boxShadow: '0 4px 8px rgba(28,25,23,0.07)', padding: '6px 10px',
  },
};

/* ── Single column detail row ── */
function ColumnRow({ col, totalRows }) {
  const [open, setOpen] = useState(false);
  const completeness = totalRows ? Math.round(((totalRows - col.nullCount) / totalRows) * 100) : 100;
  const fillCls = completeness >= 95 ? 'progress-fill-success'
    : completeness >= 80 ? 'progress-fill-warning'
    : 'progress-fill-danger';
  const TypeIcon = col.type === 'number' ? Hash : col.type === 'date' ? Calendar : Type;
  const typeColor = col.type === 'number' ? 'var(--accent-primary)'
    : col.type === 'date' ? 'var(--info)'
    : 'var(--text-muted)';

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', width: '100%', textAlign: 'left',
          cursor: 'pointer', background: 'transparent',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <TypeIcon size={13} style={{ color: typeColor, flexShrink: 0 }} />

        <span style={{
          flex: 1, fontSize: 13, fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {col.name}
        </span>

        <span className={`badge ${col.type === 'number' ? 'badge-primary' : col.type === 'date' ? 'badge-info' : 'badge-default'}`} style={{ flexShrink: 0 }}>
          {col.type}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, minWidth: 96 }}>
          <div className="progress-track" style={{ width: 56 }}>
            <div className={`progress-fill ${fillCls}`} style={{ width: `${completeness}%` }} />
          </div>
          <span style={{
            fontSize: 10, color: 'var(--text-faint)',
            minWidth: 26, textAlign: 'right',
            fontFeatureSettings: '"tnum"',
          }}>
            {completeness}%
          </span>
        </div>

        {open
          ? <ChevronUp size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          : <ChevronDown size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div style={{
          padding: '0 16px 12px 39px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 6,
          background: 'var(--bg-inset)',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ height: 8 }} /> {/* spacer row */}
          {col.type === 'number' ? (
            [['Min', col.min ?? '—'], ['Max', col.max ?? '—'], ['Mean', col.avg ?? '—'], ['Nulls', col.nullCount]].map(([l, v]) => (
              <div key={l} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', marginBottom: 3 }}>{l}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFeatureSettings: '"tnum"' }}>
                  {typeof v === 'number' ? formatNumber(v) : v}
                </p>
              </div>
            ))
          ) : (
            <>
              {[['Unique', col.uniqueCount ?? '—'], ['Nulls', col.nullCount], ['Complete', `${completeness}%`]].map(([l, v]) => (
                <div key={l} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', marginBottom: 3 }}>{l}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
              {col.topValues?.slice(0, 3).map((tv, i) => (
                <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', marginBottom: 3 }}>
                    Top {i + 1}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(tv.value)}>
                    {String(tv.value)}{' '}
                    <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>×{tv.count}</span>
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  const { datasets, activeDataset, addDataset, removeDataset, selectDataset } = useDataset();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [dragging,   setDragging]   = useState(false);
  const [parsing,    setParsing]    = useState(false);
  const [colSearch,  setColSearch]  = useState('');
  const fileRef = useRef(null);

  const handleDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
      showToast('Unsupported format. Use CSV, XLSX, or JSON.', 'warning');
      return;
    }
    setParsing(true);
    try {
      const dataset = await parseFile(file);
      addDataset(dataset);
      showToast(`"${dataset.name}" loaded — ${formatNumber(dataset.rowCount)} rows`, 'success');
    } catch (e) {
      showToast(`Parse error: ${e.message}`, 'danger');
    } finally { setParsing(false); }
  }, [addDataset, showToast]);

  const filteredCols = (activeDataset?.columns || []).filter(c =>
    c.name.toLowerCase().includes(colSearch.toLowerCase())
  );

  const numericCols = (activeDataset?.columns || []).filter(c => c.type === 'number').slice(0, 6);
  const numericChartData = numericCols.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 9) + '…' : c.name,
    avg: +(c.avg || 0).toFixed(1),
    max: +(c.max || 0).toFixed(1),
  }));

  const health  = activeDataset?.summary?.healthScore || 0;
  const missing = activeDataset?.summary?.totalMissingCells || 0;

  const healthColor = health >= 90 ? 'var(--sage-text)'
    : health >= 70 ? 'var(--warning-text)'
    : 'var(--danger-text)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 28, alignItems: 'start' }}>

      {/* ══════════ LEFT — Main workspace ══════════ */}
      <div>
        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleDrop(e.dataTransfer.files); }}
          onClick={() => !parsing && fileRef.current?.click()}
          id="file-drop-zone"
          style={{
            border: `1.5px dashed ${dragging ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            textAlign: 'center',
            cursor: parsing ? 'wait' : 'pointer',
            background: dragging ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            transition: 'all var(--transition-base)',
            marginBottom: 20,
          }}
        >
          <input
            ref={fileRef} type="file"
            accept=".csv,.xlsx,.xls,.json"
            style={{ display: 'none' }}
            id="file-input"
            onChange={e => handleDrop(e.target.files)}
          />

          {parsing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="spinner" />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Parsing file…</p>
            </div>
          ) : (
            <>
              <Upload size={18} style={{
                color: dragging ? 'var(--accent-primary)' : 'var(--text-faint)',
                margin: '0 auto 8px',
              }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                {dragging ? 'Drop to upload' : 'Drop your dataset here'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                CSV · XLSX · JSON — or{' '}
                <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>click to browse</span>
              </p>
            </>
          )}
        </div>

        {/* Dataset picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Loaded datasets
            </p>
            <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{datasets.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {datasets.map(ds => {
              const isActive = ds.id === activeDataset?.id;
              return (
                <div
                  key={ds.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => selectDataset(ds.id)}
                >
                  <Database size={13} style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-faint)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--accent-text)' : 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {ds.name}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>
                      {formatNumber(ds.rowCount)} rows · {ds.columnCount} cols · {ds.isDemo ? 'Demo' : 'Uploaded'}
                    </p>
                  </div>
                  {isActive && <CheckCircle size={12} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
                  {!ds.isDemo && (
                    <button
                      className="btn-icon"
                      style={{ padding: 3, flexShrink: 0 }}
                      onClick={e => {
                        e.stopPropagation();
                        removeDataset(ds.id);
                        showToast(`Removed "${ds.name}"`, 'info');
                      }}
                      title="Remove dataset"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column explorer */}
        {activeDataset && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 10,
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Column Explorer
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>
                  {filteredCols.length} columns · click any row to expand details
                </p>
              </div>
              <div className="search-wrapper" style={{ width: 170 }}>
                <Search size={12} className="search-icon" />
                <input
                  type="text" placeholder="Filter columns…"
                  className="input-field"
                  value={colSearch}
                  onChange={e => setColSearch(e.target.value)}
                  style={{ paddingLeft: 28, fontSize: 12 }}
                  id="column-search"
                />
              </div>
            </div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                background: 'var(--bg-inset)',
                borderBottom: '1px solid var(--border-default)',
              }}>
                <span style={{ width: 13, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
                  Column Name
                </span>
                <span style={{ width: 60, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', textAlign: 'center' }}>
                  Type
                </span>
                <span style={{ width: 110, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
                  Completeness
                </span>
                <span style={{ width: 13, flexShrink: 0 }} />
              </div>
              {filteredCols.length === 0 ? (
                <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
                  No columns match.
                </p>
              ) : (
                filteredCols.map(col => (
                  <ColumnRow key={col.name} col={col} totalRows={activeDataset.rowCount} />
                ))
              )}
            </div>

            {/* Numeric summary chart — only if meaningful */}
            {numericChartData.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Numeric Columns — Avg vs Max
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 10 }}>
                  Compare central tendency to maximum values
                </p>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 14px 10px',
                  height: 180,
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={numericChartData} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E2" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={38} />
                      <Tooltip {...TT} />
                      <Bar dataKey="avg" fill="#C05C3F" name="Average" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="max" fill="#507558" name="Max" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ RIGHT — Context panel ══════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>

        {activeDataset ? (
          <>
            {/* Dataset summary */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Dataset Summary</p>
              </div>
              <div style={{ padding: '14px' }}>
                {/* Health at a glance */}
                <div style={{
                  padding: '12px 14px',
                  background: health >= 90 ? 'var(--sage-subtle)' : health >= 70 ? 'var(--warning-subtle)' : 'var(--danger-subtle)',
                  border: `1px solid ${health >= 90 ? 'var(--sage-border)' : health >= 70 ? 'var(--warning-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Data quality score</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: healthColor }}>{health}/100</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${health >= 90 ? 'progress-fill-success' : health >= 70 ? 'progress-fill-warning' : 'progress-fill-danger'}`}
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['Rows',    formatNumber(activeDataset.rowCount)],
                    ['Columns', activeDataset.columnCount],
                    ['Missing', formatNumber(missing)],
                    ['Source',  activeDataset.isDemo ? 'Demo' : 'Uploaded'],
                  ].map(([l, v]) => (
                    <div key={l} style={{
                      padding: '8px 9px',
                      background: 'var(--bg-inset)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', fontWeight: 600, marginBottom: 2 }}>{l}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', fontFeatureSettings: '"tnum"' }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Type breakdown badges */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                  {activeDataset.isDemo && <span className="badge badge-warning">Demo data</span>}
                  <span className="badge badge-primary">
                    {(activeDataset.columns || []).filter(c => c.type === 'number').length} numeric
                  </span>
                  <span className="badge badge-default">
                    {(activeDataset.columns || []).filter(c => c.type === 'string').length} text
                  </span>
                  {(activeDataset.columns || []).filter(c => c.type === 'date').length > 0 && (
                    <span className="badge badge-info">
                      {(activeDataset.columns || []).filter(c => c.type === 'date').length} date
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Data quality warnings */}
            {(missing > 0 || (activeDataset.summary?.duplicateRows || 0) > 0) && (
              <div style={{
                background: 'var(--warning-subtle)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 13px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <AlertTriangle size={12} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning-text)' }}>Data Quality Warnings</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {missing > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--warning-text)', lineHeight: 1.5 }}>
                      {formatNumber(missing)} missing cells across{' '}
                      {(activeDataset.columns || []).filter(c => c.nullCount > 0).length} columns.
                    </p>
                  )}
                  {(activeDataset.summary?.duplicateRows || 0) > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--warning-text)', lineHeight: 1.5 }}>
                      {formatNumber(activeDataset.summary.duplicateRows)} duplicate rows.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* FastAPI info */}
            <div style={{
              padding: '11px 12px',
              background: 'var(--info-subtle)',
              border: '1px solid var(--info-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <Info size={12} style={{ color: 'var(--info)', marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--info-text)', lineHeight: 1.55 }}>
                Connect a FastAPI backend in <strong>Settings</strong> to unlock advanced ML analytics and real inference.
              </p>
            </div>

            {/* CTA */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/ask')}
            >
              Ask AI about this dataset <ArrowUpRight size={13} />
            </button>
          </>
        ) : (
          <div style={{
            padding: '20px 14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center', color: 'var(--text-muted)',
          }}>
            <Database size={22} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Select a dataset
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Upload a file or choose a demo dataset to see summary information here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
