import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, CreditCard,
  Lightbulb, PiggyBank, Target, TrendingUp, Wallet,
} from 'lucide-react';
import { endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../utils/useApi';
import { formatMoney, formatMonth, greeting } from '../utils/format';
import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import ProgressBar from '../components/ui/ProgressBar';
import InsightList from '../components/ui/InsightList';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import BudgetProgressChart from '../components/charts/BudgetProgressChart';
import TransactionTable from '../components/transactions/TransactionTable';
import { currentMonth } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApiData(endpoints.dashboard);
  const currency = user?.currency || 'INR';

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><CalendarDays size={14} /> {formatMonth(currentMonth())} Overview</p>
          <h2>{greeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="page-subtitle">Here's what's happening with your money today.</p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" icon={ArrowUpRight} onClick={() => navigate('/expenses?new=1')}>Quick Expense</Button>
          <Button icon={ArrowDownLeft} onClick={() => navigate('/transactions?new=1')}>Add Transaction</Button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          {getErrorMessage(error)} <button type="button" onClick={reload}>Retry</button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon={Wallet} label="Total Balance" value={formatMoney(stats.total_balance, currency)} caption="All-time net balance" tone="primary" loading={loading} />
        <StatCard icon={ArrowDownLeft} label="Monthly Income" value={formatMoney(stats.monthly_income, currency)} caption="Received this month" tone="success" loading={loading} />
        <StatCard icon={ArrowUpRight} label="Monthly Expenses" value={formatMoney(stats.monthly_expenses, currency)} caption="Spent this month" tone="danger" loading={loading} />
        <StatCard icon={PiggyBank} label="Total Savings" value={formatMoney(stats.total_savings, currency)} caption={`${stats.savings_goals || 0} active goals`} tone="cyan" loading={loading} />
        <StatCard icon={Target} label="Monthly Budget" value={formatMoney(stats.monthly_budget, currency)} caption={`${stats.budget_percentage || 0}% used`} tone="warning" loading={loading} />
        <StatCard icon={TrendingUp} label="Savings Rate" value={`${stats.savings_rate || 0}%`} caption="Of this month's income" tone="purple" loading={loading} />
      </div>

      <div className="dashboard-grid">
        <Card className="span-8">
          <CardHeader
            title="Income vs Expenses"
            subtitle="A six-month comparison of your cash flow"
            action={<Link to="/reports" className="text-link">View report <ArrowRight size={14} /></Link>}
          />
          {loading ? <Loader full label="Loading chart…" /> : <IncomeExpenseChart series={charts.income_vs_expense} />}
        </Card>

        <Card className="span-4">
          <CardHeader title="Spending by Category" subtitle="Where your money went this month" />
          {loading ? <Loader full label="Loading chart…" /> : <CategoryPieChart data={charts.category_expense} />}
        </Card>

        <Card className="span-8">
          <CardHeader title="Monthly Spending Trend" subtitle="Your expense and income trajectory" />
          {loading ? <Loader full label="Loading chart…" /> : <SpendingLineChart series={charts.monthly_spending} />}
        </Card>

        <Card className="span-4">
          <CardHeader title="Budget Progress" subtitle="Category limits for this month" action={<Link to="/budgets" className="text-link">Manage <ArrowRight size={14} /></Link>} />
          {loading ? <Loader full label="Loading chart…" /> : (
            <>
              <BudgetProgressChart data={charts.budget_progress} height={190} />
              {stats.monthly_budget > 0 && (
                <div className="budget-inline">
                  <ProgressBar value={stats.budget_percentage} tone={stats.budget_percentage >= 100 ? 'danger' : stats.budget_percentage >= 80 ? 'warning' : 'success'} showValue label="Overall budget" />
                  <div className="budget-inline-meta">
                    <span>{formatMoney(stats.budget_spent, currency)} spent</span>
                    <span>{formatMoney(stats.budget_remaining, currency)} left</span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="span-8">
          <CardHeader
            title="Recent Transactions"
            subtitle="Your latest money movements"
            action={<Link to="/transactions" className="text-link">View all <ArrowRight size={14} /></Link>}
          />
          {loading ? <Loader full label="Loading transactions…" /> : (
            <TransactionTable transactions={data?.recent_transactions || []} currency={currency} compact />
          )}
        </Card>

        <Card className="span-4">
          <CardHeader
            title="Smart Insights"
            subtitle="Personalised signals from your data"
            action={<Link to="/insights" className="text-link">All insights <ArrowRight size={14} /></Link>}
          />
          {loading ? <Loader full label="Analysing…" /> : <InsightList insights={data?.insights || []} limit={4} compact />}
        </Card>
      </div>

      <div className="quick-actions-row">
        <Badge tone="neutral" icon={CreditCard}>Tip: Set category budgets to unlock spending alerts</Badge>
        <Link to="/reports" className="btn btn--ghost btn--sm"><Lightbulb size={15} /> Export your monthly report</Link>
      </div>
    </div>
  );
}
