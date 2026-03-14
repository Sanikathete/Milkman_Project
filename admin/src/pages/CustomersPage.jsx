import { useEffect, useMemo, useState } from 'react'

import api from '../services/api'

function toDisplayName(email) {
  if (!email) return 'Customer'
  const namePart = email.split('@')[0]
  return namePart.replace(/[._-]+/g, ' ')
}

function CustomersPage() {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [usersResponse, ordersResponse, subsResponse] = await Promise.all([
          api.get('/users/'),
          api.get('/orders/admin/all/'),
          api.get('/subscriptions/admin/all/'),
        ])
        setUsers(usersResponse.data)
        setOrders(ordersResponse.data)
        setSubscriptions(subsResponse.data)
      } catch (err) {
        setError('Unable to load customer data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const orderCounts = useMemo(() => {
    const map = {}
    orders.forEach((order) => {
      map[order.user] = (map[order.user] || 0) + 1
    })
    return map
  }, [orders])

  const activeSubscriptions = useMemo(() => {
    const map = {}
    subscriptions.forEach((subscription) => {
      if (subscription.is_active) {
        map[subscription.user] = (map[subscription.user] || 0) + 1
      }
    })
    return map
  }, [subscriptions])

  const customers = users.filter((user) => user.role === 'CUSTOMER')

  return (
    <div>
      <h1>Customers</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="notice">Loading customers...</p>}
      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total Orders</th>
              <th>Active Subscriptions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{toDisplayName(customer.email)}</td>
                <td>{customer.profile?.phone || '—'}</td>
                <td>{customer.profile?.address || '—'}</td>
                <td>{orderCounts[customer.id] || 0}</td>
                <td>{activeSubscriptions[customer.id] || 0}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="notice">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default CustomersPage