import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { orderApi, subscriptionApi } from '../api/endpoints'

const defaultFilters = {
  payment_status: '',
  date_from: '',
  date_to: '',
}

function CustomerDashboardPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [orders, setOrders] = useState([])
  const [orderFilters, setOrderFilters] = useState(defaultFilters)
  const [subscriptionFilters, setSubscriptionFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const fetchOrders = async (filters) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    const response = await orderApi.getOrders(params)
    setOrders(response.data)
  }

  const fetchSubscriptions = async (filters) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    const response = await subscriptionApi.getSubscriptions(params)
    setSubscriptions(response.data)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        await Promise.all([fetchOrders(orderFilters), fetchSubscriptions(subscriptionFilters)])
      } catch (err) {
        setError('Unable to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (!payment) return

    if (payment === 'success') {
      setNotice('Payment completed successfully.')
    } else if (payment === 'cancel') {
      setNotice('Payment was canceled. You can try again anytime.')
    }

    const params = new URLSearchParams(searchParams)
    params.delete('payment')
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
  }, [searchParams, navigate, location.pathname])

  const applyOrderFilters = async () => {
    setError('')
    try {
      await fetchOrders(orderFilters)
    } catch (err) {
      setError('Unable to load orders with those filters.')
    }
  }

  const applySubscriptionFilters = async () => {
    setError('')
    try {
      await fetchSubscriptions(subscriptionFilters)
    } catch (err) {
      setError('Unable to load subscriptions with those filters.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brandBlue">My Dashboard</h1>
        <Link to="/" className="text-sm font-semibold text-brandBlue">Browse Products</Link>
      </div>
      {notice && <p className="text-sm text-green-700">{notice}</p>}
      {error && <p className="text-sm text-brandRed">{error}</p>}
      {loading && <p className="text-slate-500">Loading dashboard...</p>}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
        <div className="card grid gap-3 p-4 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={orderFilters.payment_status} onChange={(e) => setOrderFilters((prev) => ({ ...prev, payment_status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input type="date" className="rounded-lg border px-3 py-2" value={orderFilters.date_from} onChange={(e) => setOrderFilters((prev) => ({ ...prev, date_from: e.target.value }))} />
          <input type="date" className="rounded-lg border px-3 py-2" value={orderFilters.date_to} onChange={(e) => setOrderFilters((prev) => ({ ...prev, date_to: e.target.value }))} />
          <button className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white" onClick={applyOrderFilters}>Apply</button>
        </div>

        <div className="grid gap-4">
          {orders.map((item) => (
            <article key={item.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.product_name}</h3>
                  <p className="text-sm text-slate-600">Qty {item.quantity} | Total INR {item.total_price}</p>
                  <p className="text-xs text-slate-500">Method: {item.payment_method || 'N/A'} | Ref: {item.payment_reference || '-'}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-brandBlue">{item.payment_status}</p>
                  <p className={`${item.is_active ? 'text-green-700' : 'text-slate-500'}`}>
                    {item.is_active ? 'Confirmed' : 'Pending'}
                  </p>
                </div>
              </div>

              {item.payment_status !== 'Paid' && (
                <Link to={`/payment/order/${item.id}`} className="mt-3 inline-block rounded-lg bg-brandRed px-3 py-2 text-xs font-semibold text-white">
                  Complete Payment
                </Link>
              )}
            </article>
          ))}
          {orders.length === 0 && <p className="text-slate-500">No orders found.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">My Subscriptions</h2>
        <div className="card grid gap-3 p-4 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={subscriptionFilters.payment_status} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, payment_status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input type="date" className="rounded-lg border px-3 py-2" value={subscriptionFilters.date_from} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, date_from: e.target.value }))} />
          <input type="date" className="rounded-lg border px-3 py-2" value={subscriptionFilters.date_to} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, date_to: e.target.value }))} />
          <button className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white" onClick={applySubscriptionFilters}>Apply</button>
        </div>

        <div className="grid gap-4">
          {subscriptions.map((item) => (
            <article key={item.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.product_name}</h3>
                  <p className="text-sm text-slate-600">{item.frequency} | Starts {item.start_date}</p>
                  <p className="text-xs text-slate-500">Method: {item.payment_method || 'N/A'} | Ref: {item.payment_reference || '-'}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-brandBlue">{item.payment_status}</p>
                  <p className={`${item.is_active ? 'text-green-700' : 'text-slate-500'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {item.payment_status !== 'Paid' && (
                <Link to={`/payment/subscription/${item.id}`} className="mt-3 inline-block rounded-lg bg-brandBlue px-3 py-2 text-xs font-semibold text-white">
                  Complete Payment
                </Link>
              )}
            </article>
          ))}

          {subscriptions.length === 0 && <p className="text-slate-500">No subscriptions found.</p>}
        </div>
      </section>
    </div>
  )
}

export default CustomerDashboardPage