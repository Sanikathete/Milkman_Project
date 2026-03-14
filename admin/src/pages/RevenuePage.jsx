import { useEffect, useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

const formatINR = (value) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(number)
}

const formatCompact = (value) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(number)
}

function RevenuePage() {
  const [rows, setRows] = useState([])
  const [monthly, setMonthly] = useState([])
  const [yearly, setYearly] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchRevenue = async () => {
    setLoading(true)
    setError('')
    try {
      const [revenueResponse, analyticsResponse] = await Promise.all([
        api.get('/revenue/'),
        api.get('/analytics/'),
      ])
      setRows(revenueResponse.data)
      setMonthly(analyticsResponse.data?.monthly_revenue || [])
      setYearly(analyticsResponse.data?.yearly_revenue || [])
    } catch (err) {
      setError('Unable to load revenue data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenue()
  }, [])

  const totals = useMemo(() => {
    const totalRevenue = rows.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0)
    const totalUnits = rows.reduce((sum, row) => sum + Number(row.total_quantity_sold || 0), 0)
    const topProduct = rows.slice().sort((a, b) => Number(b.total_revenue || 0) - Number(a.total_revenue || 0))[0]
    return { totalRevenue, totalUnits, topProduct }
  }, [rows])

  const commonChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { callback: (v) => formatCompact(v) } },
      },
    }),
    [],
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Revenue Summary</h1>
          <p className="page-subtitle">Total revenue by product, month, and year (paid orders only).</p>
        </div>
        <button type="button" className="button secondary" onClick={fetchRevenue}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="notice">Loading revenue...</p>}
      {!loading && !error && (
        <>
          <div className="grid-cards" style={{ marginBottom: '22px' }}>
            <div className="kpi">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{formatINR(totals.totalRevenue)}</div>
              <div className="kpi-meta">All products combined</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Units Sold</div>
              <div className="kpi-value">{formatCompact(totals.totalUnits)}</div>
              <div className="kpi-meta">Total quantity sold</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Top Product</div>
              <div className="kpi-value">{totals.topProduct?.item || '—'}</div>
              <div className="kpi-meta">{totals.topProduct ? formatINR(totals.topProduct.total_revenue) : 'No data yet'}</div>
            </div>
          </div>

          <div className="chart-grid" style={{ marginBottom: '22px' }}>
            <div className="chart-card">
              <h3>Monthly Revenue</h3>
              <div className="chart-wrap">
                <Line
                  options={{
                    ...commonChartOptions,
                    plugins: {
                      ...commonChartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `Revenue: ${formatINR(ctx.parsed.y)}`,
                        },
                      },
                    },
                    interaction: { mode: 'index', intersect: false },
                  }}
                  data={{
                    labels: monthly.map((item) => item.month),
                    datasets: [
                      {
                        label: 'Revenue',
                        data: monthly.map((item) => item.total_revenue),
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
                    ...commonChartOptions,
                    plugins: {
                      ...commonChartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `Revenue: ${formatINR(ctx.parsed.y)}`,
                        },
                      },
                    },
                  }}
                  data={{
                    labels: yearly.map((item) => item.year),
                    datasets: [
                      {
                        label: 'Revenue',
                        data: yearly.map((item) => item.total_revenue),
                        backgroundColor: 'rgba(27, 75, 90, 0.85)',
                        borderRadius: 10,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Revenue by Product</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Total Quantity Sold</th>
                    <th>Total Purchase</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.item}>
                      <td>{row.item}</td>
                      <td>{row.total_quantity_sold}</td>
                      <td>{formatINR(row.total_purchase)}</td>
                      <td>{formatINR(row.total_revenue)}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="notice">No revenue data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RevenuePage
