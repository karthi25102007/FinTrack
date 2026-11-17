import React from 'react';
import {
  AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Crown, Gauge,
  Lightbulb, PiggyBank, Sparkles, Target, TrendingDown, TrendingUp,
} from 'lucide-react';

const ICONS = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  crown: Crown,
  gauge: Gauge,
  'piggy-bank': PiggyBank,
  target: Target,
  sparkles: Sparkles,
  'arrow-up': ArrowUpRight,
  'arrow-down': ArrowDownRight,
};

export function InsightIcon({ name }) {
  const Icon = ICONS[name] || Lightbulb;
  return <Icon size={18} />;
}

export default function InsightList({ insights = [], limit, compact = false }) {
  const items = limit ? insights.slice(0, limit) : insights;
  if (!items.length) {
    return <div className="insight-empty"><Lightbulb size={20} /><span>Insights will appear once you start tracking transactions.</span></div>;
  }
  return (
    <div className={`insight-list ${compact ? 'insight-list--compact' : ''}`}>
      {items.map((insight, index) => (
        <article key={insight.id || index} className={`insight-item insight-item--${insight.tone}`}>
          <span className="insight-icon"><InsightIcon name={insight.icon} /></span>
          <div className="insight-copy">
            <strong>{insight.title}</strong>
            <p>{insight.message}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
