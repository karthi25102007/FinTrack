import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, caption, trend, tone = 'primary', loading }) {
  if (loading) {
    return (
      <div className="glass-card stat-card stat-card--skeleton">
        <span className="skeleton skeleton--icon" />
        <span className="skeleton skeleton--line" />
        <span className="skeleton skeleton--value" />
      </div>
    );
  }
  const trendPositive = typeof trend === 'number' ? trend >= 0 : true;
  return (
    <div className={`glass-card stat-card stat-card--${tone}`}>
      <div className="stat-top">
        <span className="stat-icon"><Icon size={20} strokeWidth={2} /></span>
        {typeof trend === 'number' && (
          <span className={`stat-trend ${trendPositive ? 'up' : 'down'}`}>
            {trendPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {caption && <p className="stat-caption">{caption}</p>}
    </div>
  );
}
