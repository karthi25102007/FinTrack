import React from 'react';
import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { symbolFor } from '../../utils/format';

export default function SpendingLineChart({ series = [], height = 280 }) {
  const { user } = useAuth();
  const symbol = symbolFor(user?.currency);
  const data = (series.labels || []).map((label, index) => ({
    month: label,
    Expenses: Number(series.expense?.[index] || 0),
    Income: Number(series.income?.[index] || 0),
  }));

  return (
    <div className="chart-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,.12)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#8b93bd', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8b93bd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip
            contentStyle={{ background: '#121735', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#e8ecff', fontSize: 12 }}
            formatter={(value, name) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, name]}
          />
          <Area type="monotone" dataKey="Expenses" stroke="#a78bfa" strokeWidth={2.5} fill="url(#spendArea)" dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Income" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
