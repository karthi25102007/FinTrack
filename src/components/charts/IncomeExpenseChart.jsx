import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { symbolFor } from '../../utils/format';

export default function IncomeExpenseChart({ series = [], height = 280 }) {
  const { user } = useAuth();
  const symbol = symbolFor(user?.currency);
  const data = (series.labels || []).map((label, index) => ({
    month: label,
    Income: Number(series.income?.[index] || 0),
    Expenses: Number(series.expense?.[index] || 0),
  }));

  return (
    <div className="chart-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
          <defs>
            <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.45} />
            </linearGradient>
            <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,.12)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#8b93bd', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8b93bd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip
            cursor={{ fill: 'rgba(124,92,255,.08)' }}
            contentStyle={{ background: '#121735', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#e8ecff', fontSize: 12 }}
            formatter={(value, name) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, name]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a8b0d8', paddingTop: 8 }} />
          <Bar dataKey="Income" fill="url(#barIncome)" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="Expenses" fill="url(#barExpense)" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
