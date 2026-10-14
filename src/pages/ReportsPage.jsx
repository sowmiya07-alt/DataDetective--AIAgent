import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FileBarChart, Download, RefreshCw, TrendingUp, AlertTriangle,
  CheckCircle, Info, Sparkles, ArrowRight, Shield
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analysisService } from '../services/analysisService';
import { formatNumber, formatPercent } from '../utils/formatters';
import { exportToCsv } from '../utils/exportUtils';

/* Impact accent colors — warm, on-palette */
const IMPACT_COLOR = {
  High:     '#C05C3F',
  Medium:   '#92650A',
  Positive: '#507558',
  Low:      '#3D6095',
};

const TT = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E2DDD6',
    borderRadius: 6, fontSize: 11, color: '#1C1917',
    padding: '6px 10px',
  },
};

export default function ReportsPage() {
  const { activeDataset } = useDataset();

  const report = useMemo(() => {
    if (!activeDataset) return null;
    return analysisService.generateReport(activeDataset);
  }, [activeDataset]);

  const handleExport = () => {
    if (!report) return;
    const rows = [
      { Section: 'Dataset', Value: report.datasetName },
      { Section: 'Generated At', Value: new Date(report.generatedAt).toLocaleString() },
      { Section: 'Total Records', Value: report.totalRecords },
      { Section: 'Columns', Value: report.totalColumns },
      { Section: 'Health Score', Value: report.healthScore },
      { Section: 'Completeness', Value: `${report.completeness}%` },
      { Section: 'Missing Cells', Value: report.missingCells },
      { Section: 'Duplicate Rows', Value: report.duplicateRows },
      ...report.keyFindings.map(f => ({ Section: `Finding: ${f.title}`, Value: f.description }))
    ];
    exportToCsv(rows, `DataDetective_Report_${report.datasetName}.csv`);
  };

  if (!report) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 320, gap: 14, color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileBarChart size={18} style={{ color: 'var(--text-faint)' }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>
            No dataset loaded
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Go to <strong>Datasets</strong> to upload or select a dataset.
          </p>
        </div>
      </div>
    );
  }

  const healthColor = report.healthScore >= 90 ? 'var(--sage)'
    : report.healthScore >= 70 ? 'var(--warning)'
    : 'var(--danger)';
  const healthTextColor = report.healthScore >= 90 ? 'var(--sage-text)'
    : report.healthScore >= 70 ? 'var(--warning-text)'
    : 'var(--danger-text)';
  const healthBg = report.healthScore >= 90 ? 'var(--sage-subtle)'
    : report.healthScore >= 70 ? 'var(--warning-subtle)'
    : 'var(--danger-subtle)';
  const healthBorder = report.healthScore >= 90 ? 'var(--sage-border)'
    : report.healthScore >= 70 ? 'var(--warning-border)'
    : 'var(--danger-border)';

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header" style={{
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <h1 className="page-title">Report — {report.datasetName}</h1>
          <p className="page-subtitle">
            Generated {new Date(report.generatedAt).toLocaleString()} · {formatNumber(report.totalRecords)} records
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()} id="refresh-report-btn">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport} id="export-report-btn">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Health summary — warm palette, not dark ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 24, alignItems: 'center',
      }}>
        {/* Score ring */}
        <div>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: `conic-gradient(${healthColor} ${report.healthScore * 3.6}deg, var(--bg-muted) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--bg-surface)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: healthColor, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                {report.healthScore}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-faint)', lineHeight: 1.3 }}>/100</span>
            </div>
          </div>
        </div>

        {/* Label */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
            Data Health Score
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {formatNumber(report.totalRecords)} records across {report.totalColumns} columns analyzed
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${report.healthScore >= 90 ? 'badge-success' : report.healthScore >= 70 ? 'badge-warning' : 'badge-danger'}`}>
              {report.healthScore >= 90 ? 'Excellent quality'
               : report.healthScore >= 70 ? 'Acceptable quality'
               : 'Quality issues detected'}
            </span>
            {report.missingCells > 0 && (
              <span className="badge badge-warning">{formatNumber(report.missingCells)} missing</span>
            )}
            {report.duplicateRows > 0 && (
              <span className="badge badge-danger">{formatNumber(report.duplicateRows)} duplicates</span>
            )}
          </div>
        </div>

        {/* Right metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'right' }}>
          {[
            { label: 'Completeness', value: `${report.completeness}%` },
            { label: 'Columns', value: report.totalColumns },
            { label: 'Missing Cells', value: formatNumber(report.missingCells) },
            { label: 'Duplicates', value: formatNumber(report.duplicateRows) },
          ].map((m, i) => (
            <div key={i}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
                {m.value}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Executive Summary ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <p className="card-title"><Sparkles size={13} /> Executive Summary</p>
          <span className="badge badge-primary">AI Generated</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {report.executiveSummary.split('**').map((part, i) =>
              i % 2 === 1
                ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong>
                : part
            )}
          </p>
        </div>
      </div>

      {/* ── Key Findings — vertical editorial layout ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <p className="card-title"><TrendingUp size={13} /> Key Findings</p>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
            {report.keyFindings.length} findings
          </span>
        </div>
        <div className="card-body" style={{ padding: '4px 18px 18px' }}>
          {report.keyFindings.map((f, i) => (
            <div key={i} className="finding-card">
              <span className="finding-number">{String(i + 1).padStart(2, '0')}</span>
              <div
                className="finding-accent"
                style={{ background: IMPACT_COLOR[f.impact] || 'var(--border-strong)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {f.title}
                  </span>
                  {f.badge && (
                    <span className={`badge ${
                      f.badge === 'Opportunity' ? 'badge-success'
                      : f.badge === 'Pattern' ? 'badge-primary'
                      : 'badge-info'
                    }`}>
                      {f.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {f.description}
                </p>
              </div>
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: IMPACT_COLOR[f.impact] || 'var(--text-muted)',
                  background: `${IMPACT_COLOR[f.impact]}18` || 'var(--bg-inset)',
                  padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                  whiteSpace: 'nowrap',
                }}>
                  {f.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      {report.charts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {report.charts.map((chart, i) => (
            <div className="card" key={i}>
              <div className="card-header">
                <p className="card-title">{chart.title}</p>
              </div>
              <div className="card-body" style={{ height: 200, padding: '12px 14px 8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'bar' ? (
                    <BarChart data={chart.data} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E2" vertical={false} />
                      <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip {...TT} />
                      <Bar dataKey={chart.yKey} fill={chart.dataKeys?.[0]?.color || '#C05C3F'} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E2" vertical={false} />
                      <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip {...TT} />
                      <Line type="monotone" dataKey={chart.yKey} stroke={chart.dataKeys?.[0]?.color || '#3D6095'} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Warnings & Limitations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title"><AlertTriangle size={13} /> Warnings & Advisories</p>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.warnings.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CheckCircle size={14} style={{ color: 'var(--sage)' }} />
                <p style={{ fontSize: 12, color: 'var(--sage-text)' }}>No warnings detected</p>
              </div>
            ) : report.warnings.map((w, i) => (
              <div key={i} style={{
                padding: '11px 12px', borderRadius: 'var(--radius-sm)',
                background: w.type === 'warning' ? 'var(--warning-subtle)' : 'var(--info-subtle)',
                border: `1px solid ${w.type === 'warning' ? 'var(--warning-border)' : 'var(--info-border)'}`,
              }}>
                <p style={{
                  fontWeight: 600, fontSize: 12, marginBottom: 3,
                  color: w.type === 'warning' ? 'var(--warning-text)' : 'var(--info-text)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {w.type === 'warning'
                    ? <AlertTriangle size={11} style={{ display: 'inline', flexShrink: 0 }} />
                    : <Info size={11} style={{ display: 'inline', flexShrink: 0 }} />}
                  {w.title}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title"><Shield size={13} /> Analysis Limitations</p>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.limitations.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <ArrowRight size={12} style={{ color: 'var(--text-faint)', marginTop: 3, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
