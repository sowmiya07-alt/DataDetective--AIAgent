import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FileBarChart, Download, RefreshCw, TrendingUp, AlertTriangle,
  CheckCircle, Info, Sparkles, ArrowRight, Shield, Zap
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analysisService } from '../services/analysisService';
import { formatNumber, formatPercent } from '../utils/formatters';
import { exportToCsv } from '../utils/exportUtils';

const IMPACT_COLOR = { High: '#ef4444', Medium: '#f59e0b', Positive: '#10b981', Low: '#06b6d4' };
const BADGE_COLOR = { Opportunity: 'badge-success', Pattern: 'badge-primary', Health: 'badge-info' };

export default function ReportsPage() {
  const { activeDataset } = useDataset();
  const [generating, setGenerating] = useState(false);

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16, color: 'var(--text-muted)' }}>
        <FileBarChart size={48} style={{ opacity: 0.3 }} />
        <p style={{ fontWeight: 600 }}>No dataset loaded. Go to Analyze to upload one.</p>
      </div>
    );
  }

  const scoreColor = report.healthScore >= 90 ? '#10b981' : report.healthScore >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Executive Insights & Reports</h1>
          <p className="page-description">
            Autonomous full-dataset analysis of <strong>{report.datasetName}</strong> — Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()} id="refresh-report-btn">
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport} id="export-report-btn">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Health Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 14,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${report.healthScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: scoreColor }}>{report.healthScore}</span>
              <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>/100</span>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 4 }}>Data Health Score</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{report.totalRecords.toLocaleString()} records across {report.totalColumns} columns analyzed</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
          {[
            { label: 'Completeness', value: `${report.completeness}%` },
            { label: 'Missing Cells', value: formatNumber(report.missingCells) },
            { label: 'Duplicates', value: formatNumber(report.duplicateRows) },
            { label: 'Columns', value: report.totalColumns }
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontWeight: 700, fontSize: '1.375rem', color: '#f8fafc' }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <p className="card-title"><Sparkles size={16} /> Executive Summary</p>
          <span className="badge badge-primary"><Zap size={10} /> AI Generated</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {report.executiveSummary.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-main)' }}>{part}</strong> : part
            )}
          </p>
        </div>
      </div>

      {/* Key Findings */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <p className="card-title"><TrendingUp size={16} /> Key Findings</p>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {report.keyFindings.map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, padding: '16px',
              background: 'var(--bg-subtle)', borderRadius: 10,
              borderLeft: `4px solid ${IMPACT_COLOR[f.impact] || '#4f46e5'}`
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{f.title}</span>
                  <span className={`badge ${BADGE_COLOR[f.badge] || 'badge-default'}`}>{f.badge}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.description}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: IMPACT_COLOR[f.impact] || '#4f46e5', background: `${IMPACT_COLOR[f.impact]}15`, padding: '3px 10px', borderRadius: 20 }}>
                  {f.impact} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {report.charts.map((chart, i) => (
          <div className="card" key={i}>
            <div className="card-header">
              <p className="card-title">{chart.title}</p>
            </div>
            <div className="card-body" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'bar' ? (
                  <BarChart data={chart.data} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey={chart.yKey} fill={chart.dataKeys?.[0]?.color || '#4f46e5'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey={chart.yKey} stroke={chart.dataKeys?.[0]?.color || '#06b6d4'} strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings & Limitations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title"><AlertTriangle size={16} /> Warnings & Advisories</p>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.warnings.map((w, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 8,
                background: w.type === 'warning' ? 'var(--warning-subtle)' : 'var(--info-subtle)',
                border: `1px solid ${w.type === 'warning' ? 'var(--warning-border)' : 'var(--info-border)'}`
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: w.type === 'warning' ? 'var(--warning-text)' : 'var(--info-text)' }}>
                  {w.type === 'warning' ? <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} /> : <Info size={13} style={{ display: 'inline', marginRight: 6 }} />}
                  {w.title}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{w.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title"><Shield size={16} /> Analysis Limitations</p>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.limitations.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', marginTop: 3, flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
