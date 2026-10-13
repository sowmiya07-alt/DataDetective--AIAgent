import React from 'react';

export function Badge({ children, variant = 'default', icon: Icon, className = '', style }) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {Icon && <Icon size={12} style={{ flexShrink: 0 }} />}
      {children}
    </span>
  );
}
