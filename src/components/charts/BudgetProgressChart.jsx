import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../ui/EmptyState';
import { symbolFor } from '../../utils/format';

export default function BudgetProgressChart({ data = [], height = 270 }) {
  const { user } = useAuth();
  const symbol = symbolFor(user?.currency);
  if (!data.length) {
    return <EmptyState compact title="No category budgets yet" description="Set category limits to track your spending here." />;
  }

  return (
    <div className="chart-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 10, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,.12)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#8b93bd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <YAxis type="category" dataKey="category" width={95} tick={{ fill: '#a8b0d8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(124,92,255,.06)' }}
            contentStyle={{ background: '#121735', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#e8ecff', fontSize: 12 }}
            formatter={(value, name) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, name]}
          />
          <Bar dataKey="limit" name="Budget" fill="rgba(124,92,255,.28)" radius={[0, 5, 5, 0]} maxBarSize={11} />
          <Bar dataKey="spent" name="Spent" radius={[0, 5, 5, 0]} maxBarSize={11}>
            {data.map((entry) => (
              <Cell key={entry.id || entry.category} fill={entry.percentage >= 100 ? '#fb7185' : entry.percentage >= 80 ? '#fbbf24' : '#22d3ee'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
