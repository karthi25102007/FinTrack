import React from 'react';

export default function Badge({ children, tone = 'neutral', icon: Icon, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}
