import { useEffect, useMemo, useState } from 'react'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend)

const formatINR = (value) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(number)
}

const formatCompact = (value) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(number)
}

function AnalysisPage() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/analytics/')
      setAnalytics(response.data)
    } catch (err) {
      setError('Unable to load analytics data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const monthlyRevenue = useMemo(() => {
    return (analytics?.monthly_revenue || []).map((item) => ({
      label: item.month,
      value: item.total_revenue,
    }))
  }, [analytics])

  const yearlyRevenue = useMemo(() => {
    return (analytics?.yearly_revenue || []).map((item) => ({
      label: item.year,
      value: item.total_revenue,
    }))
  }, [analytics])

  const salesByProduct = useMemo(() => {
    return (analytics?.product_sales || []).map((item) => ({
      label: item.product,
      value: item.total_revenue,
    }))
  }, [analytics])

  const quantityByProduct = useMemo(() => {
    return (analytics?.total_sales_per_product || []).map((item) => ({
      label: item.product,
      value: item.total_quantity,
    }))
  }, [analytics])

  const subscriptionsByProduct = useMemo(() => {
    return (analytics?.subscriptions_by_product || []).map((item) => ({
      label: item.product,
      value: item.total_subscriptions,
    }))
  }, [analytics])

  const chartPalette = ['#b2441b', '#1b4b5a', '#d3a244', '#7a3e9d', '#2f855a', '#b91c1c']

  const totals = useMemo(() => {
    const totalRevenue = salesByProduct.reduce((sum, row) => sum + Number(row.value || 0), 0)
    const totalUnits = quantityByProduct.reduce((sum, row) => sum + Number(row.value || 0), 0)
    const topRevenue = salesByProduct.slice().sort((a, b) => b.value - a.value)[0]
    const topUnits = quantityByProduct.slice().sort((a, b) => b.value - a.value)[0]

    return {
      totalRevenue,
      totalUnits,
      topRevenue,
      topUnits,
    }
  }, [salesByProduct, quantityByProduct, subscriptionsByProduct])

  const commonChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { mode: 'index', intersect: false },
      },
    }),
    [],
  )

  const moneyTooltip = useMemo(
    () => ({
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        tooltip: {
          ...commonChartOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatINR(ctx.parsed.y ?? ctx.parsed)}`,
          },
        },
      },
    }),
    [commonChartOptions],
  )

  if (loading) {
    return <p className="notice">Loading analytics...</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  if (!analytics) {
    return <p className="notice">No analytics data available yet.</p>
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Analysis Dashboard</h1>
          <p className="page-subtitle">Charts are calculated from paid orders and active subscriptions.</p>
        </div>
        <button type="button" className="button secondary" onClick={fetchData}>
          Refresh
        </button>
      </div>

      <div className="grid-cards" style={{ marginBottom: '22px' }}>
        <div className="kpi">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">{formatINR(totals.totalRevenue)}</div>
          <div className="kpi-meta">Across all products</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Units Sold</div>
          <div className="kpi-value">{formatCompact(totals.totalUnits)}</div>
          <div className="kpi-meta">Total quantity sold</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Top Product (Revenue)</div>
          <div className="kpi-value">{totals.topRevenue?.label || '—'}</div>
          <div className="kpi-meta">{totals.topRevenue ? formatINR(totals.topRevenue.value) : 'No data yet'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Top Product (Units)</div>
          <div className="kpi-value">{totals.topUnits?.label || '—'}</div>
          <div className="kpi-meta">{totals.topUnits ? `${formatCompact(totals.topUnits.value)} units` : 'No data yet'}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Monthly Revenue</h3>
          <div className="chart-wrap">
            <Line
              options={{
                ...moneyTooltip,
                plugins: {
                  ...moneyTooltip.plugins,
                  legend: { display: false },
                },
                interaction: { mode: 'index', intersect: false },
                scales: {
                  x: { grid: { display: false } },
                  y: { ticks: { callback: (v) => formatCompact(v) } },
                },
              }}
              data={{
                labels: monthlyRevenue.map((item) => item.label),
                datasets: [
                  {
                    label: 'Revenue',
                    data: monthlyRevenue.map((item) => item.value),
                    borderColor: '#b2441b',
                    backgroundColor: 'rgba(178, 68, 27, 0.18)',
                    pointRadius: 2,
                    tension: 0.35,
                    fill: true,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Yearly Revenue</h3>
          <div className="chart-wrap">
            <Bar
              options={{
                ...moneyTooltip,
                plugins: {
                  ...moneyTooltip.plugins,
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { ticks: { callback: (v) => formatCompact(v) } },
                },
              }}
              data={{
                labels: yearlyRevenue.map((item) => item.label),
                datasets: [
                  {
                    label: 'Revenue',
                    data: yearlyRevenue.map((item) => item.value),
                    backgroundColor: 'rgba(27, 75, 90, 0.85)',
                    borderRadius: 10,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Most Sold Item</h3>
          <div className="chart-wrap">
            <Pie
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${formatCompact(ctx.parsed)} units`,
                    },
                  },
                },
              }}
              data={{
                labels: quantityByProduct.map((item) => item.label),
                datasets: [
                  {
                    data: quantityByProduct.map((item) => item.value),
                    backgroundColor: chartPalette,
                    borderColor: 'rgba(255,255,255,0.7)',
                    borderWidth: 2,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Most Subscribed Product</h3>
          <div className="chart-wrap">
            <Pie
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${formatCompact(ctx.parsed)} subs`,
                    },
                  },
                },
              }}
              data={{
                labels: subscriptionsByProduct.map((item) => item.label),
                datasets: [
                  {
                    data: subscriptionsByProduct.map((item) => item.value),
                    backgroundColor: chartPalette,
                    borderColor: 'rgba(255,255,255,0.7)',
                    borderWidth: 2,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Product-wise Sales</h3>
          <div className="chart-wrap">
            <Bar
              options={{
                ...moneyTooltip,
                plugins: {
                  ...moneyTooltip.plugins,
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
                  y: { ticks: { callback: (v) => formatCompact(v) } },
                },
              }}
              data={{
                labels: salesByProduct.map((item) => item.label),
                datasets: [
                  {
                    label: 'Sales',
                    data: salesByProduct.map((item) => item.value),
                    backgroundColor: 'rgba(211, 162, 68, 0.9)',
                    borderRadius: 10,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Total Sales Per Product</h3>
          <div className="chart-wrap">
            <Bar
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ${formatCompact(ctx.parsed.y)} units`,
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
                  y: { ticks: { callback: (v) => formatCompact(v) } },
                },
              }}
              data={{
                labels: quantityByProduct.map((item) => item.label),
                datasets: [
                  {
                    label: 'Units Sold',
                    data: quantityByProduct.map((item) => item.value),
                    backgroundColor: 'rgba(47, 133, 90, 0.88)',
                    borderRadius: 10,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
