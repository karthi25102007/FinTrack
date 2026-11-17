import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../ui/EmptyState';
import { symbolFor } from '../../utils/format';

const FALLBACK_COLORS = ['#7c5cff', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#fb7185', '#818cf8', '#94a3b8'];

export default function CategoryPieChart({ data = [], height = 250 }) {
  const { user } = useAuth();
  const symbol = symbolFor(user?.currency);
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const chartData = data.map((item, index) => ({
    ...item,
    value: Number(item.value || 0),
    color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));

  if (!chartData.length || total <= 0) {
    return <EmptyState compact title="No expenses this month" description="Add an expense to see your category breakdown." />;
  }

  return (
    <div className="pie-layout" style={{ minHeight: height }}>
      <div className="pie-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
              cornerRadius={5}
            >
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#121735', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#e8ecff', fontSize: 12 }}
              formatter={(value, name) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center">
          <span>Total spent</span>
          <strong>{symbol}{total >= 100000 ? `${(total / 100000).toFixed(1)}L` : total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
        </div>
      </div>
      <ul className="pie-legend">
        {chartData.slice(0, 6).map((item) => (
          <li key={item.name}>
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-name">{item.name}</span>
            <strong>{item.percentage}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
