import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSpreadsheet, MessageSquareText,
  FileBarChart, History, Settings, Database,
  ChevronLeft, ChevronRight, Upload, Search
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { formatNumber } from '../../utils/formatters';

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',    icon: LayoutDashboard,     end: true },
  { path: '/analyze', label: 'Datasets',     icon: FileSpreadsheet },
  { path: '/ask',     label: 'Ask AI',       icon: MessageSquareText },
  { path: '/reports', label: 'Reports',      icon: FileBarChart },
  { path: '/history', label: 'History',      icon: History },
];

const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(28,25,23,0.55)',
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
        top: 0,
        left: 0,
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
          padding: isCollapsed ? '0 14px' : '0 16px',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            {/* Logo mark */}
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Search size={14} color="#fff" />
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--sidebar-text-bright)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>DataDetective</p>
                <p style={{
                  fontSize: 10, fontWeight: 500,
                  color: 'var(--sidebar-text)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>AI Analyst</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                width: 24, height: 24, borderRadius: 4,
                background: 'transparent',
                color: 'var(--sidebar-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'color var(--transition-fast)',
              }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {/* ── Collapsed toggle ── */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              margin: '8px auto 0', width: 28, height: 28, borderRadius: 5,
              background: 'var(--sidebar-surface)',
              color: 'var(--sidebar-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* ── Primary Nav ── */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
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
                  gap: isCollapsed ? 0 : 9,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '9px 0' : '8px 10px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  borderLeft: `2px solid ${isActive && !isCollapsed ? 'var(--sidebar-active-accent)' : 'transparent'}`,
                  paddingLeft: isActive && !isCollapsed ? 8 : (isCollapsed ? 0 : 10),
                  transition: 'all var(--transition-fast)',
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={16} style={{ flexShrink: 0, opacity: 0.85 }} />
                {!isCollapsed && <span style={{ lineHeight: 1 }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Active Dataset Chip ── */}
        {!isCollapsed && activeDataset && (
          <div style={{
            margin: '0 8px 10px',
            padding: '10px 12px',
            background: 'var(--sidebar-surface)',
            borderRadius: 7,
            border: '1px solid var(--sidebar-border)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sidebar-text)', marginBottom: 5 }}>
              Active Dataset
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Database size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--sidebar-text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={activeDataset.name}>
                {activeDataset.name}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--sidebar-text)' }}>
              <span>{formatNumber(activeDataset.rowCount)} rows</span>
              <span style={{ padding: '1px 6px', borderRadius: 3, background: activeDataset.isDemo ? 'rgba(192,92,63,0.15)' : 'rgba(88,122,95,0.18)', color: activeDataset.isDemo ? '#E8A088' : '#8FBD97', fontSize: 10, fontWeight: 600 }}>
                {activeDataset.isDemo ? 'DEMO' : 'LIVE'}
              </span>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              style={{
                marginTop: 8, width: '100%', padding: '5px 0',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--sidebar-border)',
                borderRadius: 4, fontSize: 11, color: 'var(--sidebar-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                cursor: 'pointer', transition: 'background var(--transition-fast)',
              }}
            >
              <Upload size={11} /> Change Dataset
            </button>
          </div>
        )}

        {/* ── Bottom Nav ── */}
        <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--sidebar-border)' }}>
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
                  gap: isCollapsed ? 0 : 9,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '9px 0' : '8px 10px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={16} style={{ flexShrink: 0, opacity: 0.85 }} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}
