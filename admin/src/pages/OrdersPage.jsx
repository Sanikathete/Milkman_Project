import { useEffect, useState } from 'react'

import api from '../services/api'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/orders/admin/all/')
        setOrders(response.data)
      } catch (err) {
        setError('Unable to load orders.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div>
      <h1>Orders</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="notice">Loading orders...</p>}
      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Total Value</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.user}</td>
                <td>{order.user_email}</td>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>INR {Number(order.total_price).toFixed(2)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <span className="badge">{order.payment_status}</span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="notice">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default OrdersPage