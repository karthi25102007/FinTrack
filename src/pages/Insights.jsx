import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, ChartNoAxesCombined, Sparkles } from 'lucide-react';
import { endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../utils/useApi';
import { formatMoney } from '../utils/format';
import Card, { CardHeader } from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import InsightList from '../components/ui/InsightList';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';

export default function Insights() {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const insights = useApiData(endpoints.insights);
  const analytics = useApiData(`${endpoints.analytics}?months=6`);

  const tones = {
    positive: (insights.data?.insights || []).filter((item) => item.tone === 'positive').length,
    warning: (insights.data?.insights || []).filter((item) => item.tone === 'warning').length,
    negative: (insights.data?.insights || []).filter((item) => item.tone === 'negative').length,
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><Sparkles size={14} /> SMART ANALYSIS</p>
          <h2>Financial Insights</h2>
          <p className="page-subtitle">Personalised signals generated from your own transaction history.</p>
        </div>
        <Badge tone="primary" icon={BrainCircuit}>Python-powered analysis</Badge>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat"><span>Insights generated</span><strong>{insights.data?.insights?.length || 0}</strong></div>
        <div className="mini-stat"><span>Positive signals</span><strong className="text-positive">{tones.positive}</strong></div>
        <div className="mini-stat"><span>Watch-outs</span><strong className="text-warning">{tones.warning}</strong></div>
        <div className="mini-stat"><span>Critical alerts</span><strong className="text-negative">{tones.negative}</strong></div>
      </div>

      <div className="dashboard-grid">
        <Card className="span-8">
          <CardHeader title="Cash Flow Patterns" subtitle="Six months of income and expenses" action={<Link to="/reports" className="text-link">Full report <ArrowRight size={14} /></Link>} />
          {analytics.loading ? <Loader full label="Analysing…" /> : <IncomeExpenseChart series={analytics.data?.series} />}
        </Card>

        <Card className="span-4">
          <CardHeader title="Top Spending Categories" subtitle="This month's breakdown" />
          {analytics.loading ? <Loader full label="Analysing…" /> : (
            <div className="insight-category-list">
              {(analytics.data?.categories_expense || []).slice(0, 6).map((category) => (
                <div key={category.name} className="insight-category-row">
                  <div className="insight-category-head">
                    <span><span className="legend-dot" style={{ background: category.color }} />{category.name}</span>
                    <strong>{formatMoney(category.value, currency)}</strong>
                  </div>
                  <ProgressBar value={category.percentage} height={6} tone="primary" />
                </div>
              ))}
              {!(analytics.data?.categories_expense || []).length && <p className="muted">No expense data yet.</p>}
            </div>
          )}
        </Card>

        <Card className="span-12">
          <CardHeader title="Your Insight Feed" subtitle="Updated automatically as you add transactions" />
          {insights.error && <div className="alert alert--error">{getErrorMessage(insights.error)}</div>}
          {insights.loading ? <Loader full label="Generating insights…" /> : <InsightList insights={insights.data?.insights || []} />}
        </Card>
      </div>

      <div className="insight-note">
        <ChartNoAxesCombined size={18} />
        <p><strong>Built for the future.</strong> Insight generation runs in Python today and is designed with a clean service layer so an AI model can be plugged in later without changing the UI.</p>
      </div>
    </div>
  );
}
