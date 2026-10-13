import React from 'react';

export function Card({ children, className = '', style, onClick }) {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div>
        <h3 className="card-title">
          {Icon && <Icon size={18} style={{ color: 'var(--accent-primary)' }} />}
          {title}
        </h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '', style }) {
  return (
    <div className={`card-body ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style }) {
  return (
    <div className={`card-footer ${className}`} style={style}>
      {children}
    </div>
  );
}
