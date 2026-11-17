import React from 'react';

export default function ProgressBar({ value = 0, tone = 'primary', height = 8, showValue = false, label }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="progress-wrap">
      {(label || showValue) && (
        <div className="progress-meta">
          {label && <span>{label}</span>}
          {showValue && <strong>{clamped.toFixed(0)}%</strong>}
        </div>
      )}
      <div className={`progress progress--${tone}`} style={{ height }}>
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
