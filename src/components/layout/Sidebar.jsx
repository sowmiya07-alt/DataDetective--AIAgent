import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSpreadsheet, MessageSquareText,
  FileBarChart, History, Settings, Database,
  ChevronLeft, ChevronRight, Upload, ScanSearch
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { formatNumber } from '../../utils/formatters';

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/analyze', label: 'Datasets',  icon: FileSpreadsheet },
  { path: '/ask',     label: 'Ask AI',    icon: MessageSquareText },
  { path: '/reports', label: 'Reports',   icon: FileBarChart },
  { path: '/history', label: 'History',   icon: History },
];

const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(28,25,23,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
          }}
        />
      )}

      <aside style={{
        width: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-smooth)',
        position: isMobileOpen ? 'fixed' : 'sticky',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 50,
        flexShrink: 0,
        overflow: 'hidden',
      }}>

        {/* ── Brand ── */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0 12px' : '0 14px',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
            {/* Logo mark */}
            <div style={{
              width: 26, height: 26, borderRadius: 5,
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ScanSearch size={13} color="#fff" strokeWidth={2} />
            </div>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--sidebar-text-bright)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap', lineHeight: 1.2,
                }}>
                  DataDetective
                </p>
                <p style={{
                  fontSize: 9, fontWeight: 600,
                  color: 'var(--sidebar-text)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase', lineHeight: 1.1,
                }}>
                  AI Analyst
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: 'transparent',
                color: 'var(--sidebar-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'color var(--transition-fast), background var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={13} />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              margin: '8px auto 0',
              width: 26, height: 26, borderRadius: 5,
              background: 'var(--sidebar-surface)',
              color: 'var(--sidebar-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--sidebar-surface)'}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}

        {/* ── Primary Nav ── */}
        <nav style={{
          flex: 1, padding: '10px 7px',
          display: 'flex', flexDirection: 'column', gap: 1,
          overflowY: 'auto',
        }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : 8,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '8px 0' : '7px 9px',
                  borderRadius: 5,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  borderLeft: `2px solid ${isActive && !isCollapsed ? 'var(--sidebar-active-accent)' : 'transparent'}`,
                  paddingLeft: isActive && !isCollapsed ? 7 : (isCollapsed ? 0 : 9),
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={15} style={{ flexShrink: 0, opacity: 0.8 }} />
                {!isCollapsed && <span style={{ lineHeight: 1 }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Active Dataset chip ── */}
        {!isCollapsed && activeDataset && (
          <div style={{
            margin: '0 7px 8px',
            padding: '10px 11px',
            background: 'var(--sidebar-surface)',
            borderRadius: 6,
            border: '1px solid var(--sidebar-border)',
          }}>
            <p style={{
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--sidebar-text)',
              marginBottom: 5,
            }}>
              Active Dataset
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <Database size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <p style={{
                fontSize: 12, fontWeight: 500,
                color: 'var(--sidebar-text-bright)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }} title={activeDataset.name}>
                {activeDataset.name}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--sidebar-text)', fontFeatureSettings: '"tnum"' }}>
                {formatNumber(activeDataset.rowCount)} rows
              </span>
              <span style={{
                padding: '1px 5px', borderRadius: 3,
                background: activeDataset.isDemo ? 'rgba(192,92,63,0.18)' : 'rgba(80,117,88,0.20)',
                color: activeDataset.isDemo ? '#E8A088' : '#8AB89A',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
              }}>
                {activeDataset.isDemo ? 'DEMO' : 'LIVE'}
              </span>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              style={{
                marginTop: 7, width: '100%', padding: '4px 0',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--sidebar-border)',
                borderRadius: 4, fontSize: 10,
                color: 'var(--sidebar-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <Upload size={10} /> Change Dataset
            </button>
          </div>
        )}

        {/* ── Bottom nav ── */}
        <div style={{ padding: '7px 7px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
          {BOTTOM_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : 8,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '8px 0' : '7px 9px',
                  borderRadius: 5,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={15} style={{ flexShrink: 0, opacity: 0.8 }} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}
