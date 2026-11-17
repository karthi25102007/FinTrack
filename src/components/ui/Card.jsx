import React from 'react';

export default function Card({ children, className = '', padded = true, ...props }) {
  return (
    <section className={`glass-card ${padded ? 'card-pad' : ''} ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div>
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-action">{action}</div>}
    </div>
  );
}
