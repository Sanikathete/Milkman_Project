import { useEffect, useState } from 'react'

import { orderApi, subscriptionApi, userApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

const defaultFilters = {
  payment_status: '',
  date_from: '',
  date_to: '',
}

function AdminDashboardPage() {
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderFilters, setOrderFilters] = useState(defaultFilters)
  const [subscriptionFilters, setSubscriptionFilters] = useState(defaultFilters)

  const fetchOrders = async (filters) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    const response = await orderApi.getAllOrders(params)
    setOrders(response.data)
  }

  const fetchSubscriptions = async (filters) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    const response = await subscriptionApi.getAllSubscriptions(params)
    setSubscriptions(response.data)
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true)
      setError('')
      try {
        const usersResponse = await userApi.getUsers()
        setUsers(usersResponse.data)
        await Promise.all([fetchOrders(orderFilters), fetchSubscriptions(subscriptionFilters)])
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load admin dashboard data.'))
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brandBlue">Admin Dashboard</h1>
      {error && <p className="text-sm text-brandRed">{error}</p>}
      {loading && <p className="text-slate-500">Loading dashboard...</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-3xl font-bold text-brandBlue">{users.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-3xl font-bold text-brandBlue">{orders.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total Subscriptions</p>
          <p className="text-3xl font-bold text-brandBlue">{subscriptions.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Active Subscriptions</p>
          <p className="text-3xl font-bold text-brandBlue">{subscriptions.filter((item) => item.is_active).length}</p>
        </div>
      </div>

      <section className="card p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Order History</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={orderFilters.payment_status} onChange={(e) => setOrderFilters((prev) => ({ ...prev, payment_status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input type="date" className="rounded-lg border px-3 py-2" value={orderFilters.date_from} onChange={(e) => setOrderFilters((prev) => ({ ...prev, date_from: e.target.value }))} />
          <input type="date" className="rounded-lg border px-3 py-2" value={orderFilters.date_to} onChange={(e) => setOrderFilters((prev) => ({ ...prev, date_to: e.target.value }))} />
          <button className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white" onClick={() => fetchOrders(orderFilters)}>Apply</button>
        </div>
        <div className="space-y-2 text-sm">
          {orders.slice(0, 20).map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <span className="font-semibold">{item.user_email}</span> ordered <span className="font-semibold">{item.product_name}</span>
              {' '}({item.payment_status}, {item.payment_method || 'N/A'})
            </div>
          ))}
          {orders.length === 0 && <p className="text-slate-500">No orders found.</p>}
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Subscription History</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={subscriptionFilters.payment_status} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, payment_status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input type="date" className="rounded-lg border px-3 py-2" value={subscriptionFilters.date_from} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, date_from: e.target.value }))} />
          <input type="date" className="rounded-lg border px-3 py-2" value={subscriptionFilters.date_to} onChange={(e) => setSubscriptionFilters((prev) => ({ ...prev, date_to: e.target.value }))} />
          <button className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white" onClick={() => fetchSubscriptions(subscriptionFilters)}>Apply</button>
        </div>
        <div className="space-y-2 text-sm">
          {subscriptions.slice(0, 20).map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <span className="font-semibold">{item.user_email}</span> subscribed to <span className="font-semibold">{item.product_name}</span>
              {' '}({item.payment_status}, {item.payment_method || 'N/A'})
            </div>
          ))}
          {subscriptions.length === 0 && <p className="text-slate-500">No subscriptions found.</p>}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
