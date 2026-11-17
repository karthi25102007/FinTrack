import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, PiggyBank } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { symbolFor } from '../utils/format';
import { downloadFile, endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiData } from '../utils/useApi';
import { formatMoney } from '../utils/format';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionTable from '../components/transactions/TransactionTable';

const PERIODS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
];

export default function Reports() {
  const { user } = useAuth();
  const { notify } = useToast();
  const currency = user?.currency || 'INR';
  const [period, setPeriod] = useState('month');
  const [type, setType] = useState('all');

  const query = `?period=${period}&type=${type}`;
  const { data, loading, error, reload } = useApiData(`${endpoints.reports}${query}`);
  const [exporting, setExporting] = useState(false);

  const exportReport = async (format) => {
    setExporting(true);
    try {
      const name = `fintrack-${period}-report.${format}`;
      await downloadFile(`${endpoints.export}${query}&format=${format}`, name);
      notify(`${format.toUpperCase()} report downloaded.`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};
  const series = data?.series || [];
  const chartData = series.map((item) => ({ month: item.label, Income: item.income, Expenses: item.expense }));

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><BarChart3 size={14} /> ANALYTICS & EXPORT</p>
          <h2>Reports & Analytics</h2>
          <p className="page-subtitle">Understand your financial performance over any time horizon.</p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" icon={type === 'expense' ? FileSpreadsheet : FileText} loading={exporting} onClick={() => exportReport('csv')}>Export CSV</Button>
          <Button icon={Download} loading={exporting} onClick={() => exportReport('pdf')}>Export PDF</Button>
        </div>
      </div>

      <div className="tabs-row">
        <div className="tabs">
          {PERIODS.map((item) => (
            <button key={item.value} type="button" className={period === item.value ? 'active' : ''} onClick={() => setPeriod(item.value)}>{item.label}</button>
          ))}
        </div>
        <div className="tabs tabs--subtle">
          {TYPES.map((item) => (
            <button key={item.value} type="button" className={type === item.value ? 'active' : ''} onClick={() => setType(item.value)}>{item.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert--error">{getErrorMessage(error)} <button onClick={reload}>Retry</button></div>}

      {loading ? <Loader full label="Building your report…" /> : (
        <>
          <div className="report-meta">
            <strong>{data?.meta?.label}</strong>
            <span>{data?.meta?.start} → {data?.meta?.end}</span>
            <span>{data?.transactions?.length || 0} transactions included</span>
          </div>

          <div className="mini-stats-grid">
            <div className="mini-stat"><span>Total income</span><strong className="text-positive">{formatMoney(summary.income, currency)}</strong></div>
            <div className="mini-stat"><span>Total expenses</span><strong className="text-negative">{formatMoney(summary.expense, currency)}</strong></div>
            <div className="mini-stat"><span>Net savings</span><strong>{formatMoney(summary.net, currency)}</strong></div>
            <div className="mini-stat"><span>Savings rate</span><strong>{summary.savings_rate || 0}%</strong></div>
            <div className="mini-stat"><span>Avg. transaction</span><strong>{formatMoney(summary.average, currency)}</strong></div>
          </div>

          <div className="dashboard-grid">
            <Card className="span-8">
              <CardHeader title="Income vs Expense" subtitle={`${data?.meta?.label} breakdown`} />
              <div className="chart-wrap" style={{ height: 290 }}>
                <ReportChart data={chartData} currency={currency} />
              </div>
            </Card>
            <Card className="span-4">
              <CardHeader title="Category Spending" subtitle="Where your money went" />
              <CategoryPieChart data={data?.category_spending || []} />
            </Card>
            <Card className="span-8">
              <CardHeader title="Transactions in Period" subtitle={`${data?.transactions?.length || 0} records`} />
              <TransactionTable
                transactions={(data?.transactions || []).slice(0, 15)}
                currency={currency}
                compact
              />
            </Card>
            <Card className="span-4">
              <CardHeader title="Savings Goals" subtitle="Progress towards your targets" />
              <div className="report-goals">
                {(data?.savings_goals || []).map((goal) => (
                  <div key={goal.name} className="report-goal">
                    <div><PiggyBank size={15} /><strong>{goal.name}</strong></div>
                    <span>{goal.progress}% · {formatMoney(goal.remaining, currency)} left</span>
                  </div>
                ))}
                {!(data?.savings_goals || []).length && <p className="muted">No savings goals recorded.</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function ReportChart({ data, currency }) {
  const symbol = symbolFor(currency);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }} barGap={3}>
        <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,.12)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#8b93bd', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8b93bd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
        <Tooltip contentStyle={{ background: '#121735', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#e8ecff', fontSize: 12 }} formatter={(v, n) => [`${symbol}${Number(v).toLocaleString('en-IN')}`, n]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a8b0d8' }} />
        <Bar dataKey="Income" fill="#34d399" radius={[5, 5, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Expenses" fill="#a78bfa" radius={[5, 5, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
