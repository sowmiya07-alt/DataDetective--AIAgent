import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, text = 'Loading data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        gap: 12,
        color: 'var(--text-muted)'
      }}
    >
      <Loader2
        size={size}
        style={{
          color: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <span style={{ fontSize: '0.875rem' }}>{text}</span>}
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = 16, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#e2e8f0',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
}
