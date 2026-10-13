import React from 'react';
import { Database } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Database,
  title = 'No Data Available',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
  style
}) {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        ...style
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-subtle)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}
      >
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 440, marginBottom: actionLabel ? 20 : 0 }}>
        {description}
      </p>
      {actionLabel && (
        <Button variant="primary" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
